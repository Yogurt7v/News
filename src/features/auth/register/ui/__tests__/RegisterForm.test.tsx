import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '../RegisterForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('отрисовка все полей', () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/подтвердите/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    ).toBeInTheDocument();
  });

  it('показывать ошибку если пароли не совпадают', async () => {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
    await userEvent.type(screen.getByLabelText(/подтвердите/i), '654321');
    await userEvent.click(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    );

    expect(
      await screen.findByText(/пароли не совпадают/i)
    ).toBeInTheDocument();
  });

  it('calls fetch with correct data on valid form', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/имя/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
    await userEvent.type(screen.getByLabelText(/подтвердите/i), '123456');
    await userEvent.click(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@test.com',
          password: '123456',
        }),
      });
    });
  });

  it('отображать ошибку ', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Email already exists' }),
    });

    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText(/имя/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/пароль/i), '123456');
    await userEvent.type(screen.getByLabelText(/подтвердите/i), '123456');
    await userEvent.click(
      screen.getByRole('button', { name: /зарегистрироваться/i })
    );

    expect(
      await screen.findByText(/email already exists/i)
    ).toBeInTheDocument();
  });
});
