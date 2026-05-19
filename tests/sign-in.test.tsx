import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import SignInScreen from '../app/(auth)/sign-in';
import { supabase } from '../src/lib/supabase';

const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockSignUp = supabase.auth.signUp as jest.Mock;

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in with the entered email and password', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const screen = render(<SignInScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'friend@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret-pass');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() =>
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'friend@example.com',
        password: 'secret-pass',
      }),
    );
  });

  it('creates an account and asks the user to confirm email', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const screen = render(<SignInScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'new@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret-pass');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'secret-pass',
      }),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Check your email',
      'Confirm your account before signing in.',
    );
  });
});
