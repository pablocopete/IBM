import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import Auth from './Auth';
import { supabase } from '@/integrations/supabase/client';

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders auth form with sign in and sign up tabs', () => {
    render(<Auth />);
    
    expect(screen.getByText('Secure Authentication')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
  });

  it('displays Google OAuth button', () => {
    render(<Auth />);
    
    const googleButton = screen.getAllByText(/continue with google/i)[0];
    expect(googleButton).toBeInTheDocument();
  });

  it('validates email input', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in securely/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in securely/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('calls Google OAuth on button click', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    
    const googleButton = screen.getAllByText(/continue with google/i)[0];
    await user.click(googleButton);
    
    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/intelligent'),
        }),
      });
    });
  });

  it('handles email sign in', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const signInButton = screen.getByRole('button', { name: /sign in securely/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signInButton);
    
    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles email sign up', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    
    // Switch to sign up tab
    const signUpTab = screen.getByRole('tab', { name: /sign up/i });
    await user.click(signUpTab);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(/min\. 8 characters/i);
    const signUpButton = screen.getByRole('button', { name: /create secure account/i });
    
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(signUpButton);
    
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: expect.objectContaining({
          emailRedirectTo: expect.any(String),
        }),
      });
    });
  });

  it('displays security features', () => {
    render(<Auth />);
    
    expect(screen.getByText(/HTTPS Only/i)).toBeInTheDocument();
    expect(screen.getByText(/256-bit Encryption/i)).toBeInTheDocument();
    expect(screen.getByText(/Rate Limited/i)).toBeInTheDocument();
  });
});
