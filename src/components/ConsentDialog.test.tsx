import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { ConsentDialog } from './ConsentDialog';
import { supabase } from '@/integrations/supabase/client';

describe('ConsentDialog', () => {
  const mockOnConsent = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-id', email: 'test@example.com' } as any,
          access_token: 'token',
        } as any,
      },
      error: null,
    });
  });

  it('renders when open is true', () => {
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    expect(screen.getByText(/data collection consent/i)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <ConsentDialog 
        open={false} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    expect(screen.queryByText(/data collection consent/i)).not.toBeInTheDocument();
  });

  it('displays all consent options', () => {
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    expect(screen.getByText(/calendar access/i)).toBeInTheDocument();
    expect(screen.getByText(/email access/i)).toBeInTheDocument();
    expect(screen.getByText(/data processing/i)).toBeInTheDocument();
    expect(screen.getByText(/data storage/i)).toBeInTheDocument();
  });

  it('requires all consents to be checked before accepting', async () => {
    const user = userEvent.setup();
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    const acceptButton = screen.getByRole('button', { name: /accept and continue/i });
    
    // Button should be disabled initially
    expect(acceptButton).toBeDisabled();
    
    // Check all consents
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
    
    // Button should now be enabled
    await waitFor(() => {
      expect(acceptButton).toBeEnabled();
    });
  });

  it('saves consents to database when accepted', async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as any);
    
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    // Check all consents
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
    
    const acceptButton = screen.getByRole('button', { name: /accept and continue/i });
    await user.click(acceptButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_consents');
      expect(mockOnConsent).toHaveBeenCalled();
    });
  });

  it('allows user to decline', async () => {
    const user = userEvent.setup();
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    const declineButton = screen.getByRole('button', { name: /decline/i });
    await user.click(declineButton);
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays privacy policy link', () => {
    render(
      <ConsentDialog 
        open={true} 
        onOpenChange={mockOnOpenChange}
        onConsent={mockOnConsent}
      />
    );
    
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });
});
