/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { bills } from '../fixtures/bills.js';
import mockStore from '../__mocks__/store';

import router from '../app/Router.js';
import userEvent from '@testing-library/user-event';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then the NewBill Form should be displayed', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion

      const newBillForm = screen.getByTestId('form-new-bill');

      expect(newBillForm).toBeTruthy();
    });

    test('Then mail icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');

      expect(mailIcon.classList.contains('active-icon')).toBeTruthy();
    });
  });

  describe('When I am on NewBill Page and I upload an image into the form', () => {
    test('Then I should be able to read the file name in the field', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ trype: 'Employee' }));

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const fileInput = screen.getByTestId('file');
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e));

      fileInput.addEventListener('change', handleChange);
      userEvent.upload(fileInput, file);

      expect(handleChange).toHaveBeenCalled();
      expect(fileInput.files[0].name).toEqual('hello.png');
    });
  });

  describe('When I am on NewBill Page and I upload a file different than png, jpeg, or jpg', () => {
    test('Then I should see an error message below the field', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ trype: 'Employee' }));

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const fileInput = screen.getByTestId('file');
      const file = new File(['hello'], 'hello.svg', { type: 'image/svg+xml' });
      const handleChange = jest.fn((e) => newBill.handleChangeFile(e));

      fileInput.addEventListener('change', handleChange);
      userEvent.upload(fileInput, file);

      expect(handleChange).toHaveBeenCalled();
      expect(screen.getByText('Veuilez ajouter une image de type PNG, JPG, ou JPEG.')).toBeTruthy();
    });
  });

  describe('When I am on NewBill Page and I click on submit button', () => {
    test('Then I should navigate to Bills Page', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ trype: 'Employee' }));

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const form = screen.getByTestId('form-new-bill');
      const submit = screen.getByText('Envoyer');
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      form.addEventListener('submit', handleSubmit);
      userEvent.click(submit);

      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  });
});

// test d'integration POST
describe('Given I am a user connected as an Employee', () => {
  describe('When I am on NewBill Page and I submit a new one', () => {
    test('Then it should send the bill from the mock API', async () => {
      const postSpy = jest.spyOn(mockStore.bills(), 'update');
      const newBill = await mockStore.bills().update();
      expect(postSpy).toHaveBeenCalled();
      expect(newBill.id).toEqual('47qAXb6fIm2zOKkLzMro');
      expect(newBill.fileUrl).toEqual(
        'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a'
      );
    });
  });
});
