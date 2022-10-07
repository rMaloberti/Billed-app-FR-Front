/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

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
    test('Then I should navigate to Bills Page', () => {});
  });
});

// test d'integration POST
