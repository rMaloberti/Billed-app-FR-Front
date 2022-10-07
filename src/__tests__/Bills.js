/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import Bills from '../containers/Bills.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

import router from '../app/Router.js';
import userEvent from '@testing-library/user-event';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression

      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      expect(dates).toEqual(datesSorted);
    });
  });
  describe('When I am on Bills Page and I click on the button Eye icon', () => {
    test('Then, I open the modal proof', () => {
      const onNavigate = (pathname) => {
        document.vody.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

      const bill = new Bills({ document, onNavigate, store, localStorage: window.localStorage });

      document.body.innerHTML = BillsUI({ data: bills });

      const icon = screen.getAllByTestId('icon-eye')[0];
      const modal = screen.getByTestId('modaleFile');
      const handleShowProof = jest.fn(() => bill.handleClickIconEye(icon));

      $.fn.modal = jest.fn(() => modal.classList.add('show'));
      icon.addEventListener('click', handleShowProof);
      userEvent.click(icon);

      expect(handleShowProof).toHaveBeenCalled();
      expect(screen.getByTestId('modaleFile').classList.contains('show')).toBeTruthy();
    });
  });

  describe('When I am on Bills Page and I open a modal proof', () => {
    test('Then, I click on the close button to close the modal', () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const modal = screen.getByTestId('modaleFile');
      const closeModal = screen.getByLabelText('Close');

      modal.classList.add('show');

      closeModal.addEventListener('click', () => modal.classList.remove('show'));

      userEvent.click(closeModal);

      expect(!modal.classList.contains('show')).toBeTruthy();
    });
  });

  describe('When I am on Bills Page and I click on the button New Bill', () => {
    test('The, I navigate to NewBill page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

      const bill = new Bills({ document, onNavigate, store, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bill });

      const handleClick = jest.fn(() => bill.handleClickNewBill());
      const buttonNewBill = screen.getByTestId('btn-new-bill');

      buttonNewBill.addEventListener('click', handleClick);
      userEvent.click(buttonNewBill);

      expect(handleClick).toHaveBeenCalled();
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
});

// test d'integration GET
describe('Given I am a user connected as Employee', () => {
  describe('When I am on Bills Page', () => {
    test('fetches bills from mock API GET', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Admin', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);

      const getSpy = jest.spyOn(mockStore, 'bills');
      const bills = await mockStore.bills().list();
      const content = await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(content).toBeTruthy();
      expect(getSpy).toBeCalled();
      expect(bills).toHaveLength(4);
    });
  });
  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'User', email: 'a@a' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');

      document.body.append(root);
      router();
    });
    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test('fetches bills from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
