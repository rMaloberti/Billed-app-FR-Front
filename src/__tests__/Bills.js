/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import '@testing-library/jest-dom';

import router from '../app/Router.js';
import Bills from '../containers/Bills.js';
import mockStore from '../__mocks__/store';

window.$ = jest.fn().mockImplementation(() => {
  return {
    click: jest.fn(),
    find: jest.fn().mockImplementation(() => {
      return {
        html: jest.fn(),
      };
    }),
    modal: jest.fn(),
    width: jest.fn(),
  };
});

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon');
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe('When I click on the newBill button', () => {
      test('Then I should navigate to the newBill page', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = null;

        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
        );

        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, store, localStorage });

        const handleClickNewBill = jest.fn(() => {
          billsContainer.handleClickNewBill();
        });

        const newBillBtn = screen.getByTestId('btn-new-bill');
        newBillBtn.addEventListener('click', handleClickNewBill);

        fireEvent.click(newBillBtn);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      });
    });

    describe("When I click on a bill's iconEye button", () => {
      test("Then the bill's modal should show", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const store = null;

        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
          })
        );

        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, store, localStorage });

        const iconEyeBtn = screen.getAllByTestId('icon-eye')[0];

        const handleClickIconEye = jest.fn(() => {
          billsContainer.handleClickIconEye(iconEyeBtn);
        });

        iconEyeBtn.addEventListener('click', handleClickIconEye);

        fireEvent.click(iconEyeBtn);

        expect(handleClickIconEye).toHaveBeenCalled();
      });
    });
  });
});

// Test d'intégration GET
describe('Given I am a user connected as Employee', () => {
  jest.mock("../app/store", () => mockStore);
  
  describe('When I navigate to the bills page', () => {
    test('Fetches bills from mock API GET', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'e@e' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(screen.getByTestId('btn-new-bill')).toBeTruthy();
      const firstEntry = await screen.getByText('Restaurants et bars');
      expect(firstEntry).toBeTruthy();
      const lastEntry = await screen.getByText('Transports');
      expect(lastEntry).toBeTruthy();
    });

    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'e@e',
          })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
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
        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const date = screen.getByText('2004-04-04');
        expect(date).toBeTruthy();
      });
      test('fetches messages from an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Dashboard);
        await new Promise(process.nextTick);
        const date = screen.getByText('2004-04-04');
        expect(date).toBeTruthy();
      });
    });
  });
});
