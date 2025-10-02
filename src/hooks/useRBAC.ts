import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AppRole = 'admin' | 'user' | 'viewer';

interface UseRBACReturn {
  roles: AppRole[];
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for Role-Based Access Control
 * Fetches user roles and provides utilities to check permissions
 */
export function useRBAC(): UseRBACReturn {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRoles([]);
          setIsLoading(false);
          return;
        }

        // Fetch user roles from database
        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (fetchError) {
          throw fetchError;
        }

        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch roles');
        setError(error);
        console.error('Error fetching user roles:', error);
        
        toast({
          title: 'Permission Error',
          description: 'Failed to load user permissions',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRoles();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = roles.includes('admin');

  return {
    roles,
    hasRole,
    isAdmin,
    isLoading,
    error
  };
}

/**
 * Hook to require specific role
 * Redirects or shows error if user doesn't have required role
 */
export function useRequireRole(requiredRole: AppRole): {
  hasAccess: boolean;
  isLoading: boolean;
} {
  const { hasRole, isLoading } = useRBAC();
  const { toast } = useToast();
  const hasAccess = hasRole(requiredRole);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      toast({
        title: 'Access Denied',
        description: `You need ${requiredRole} role to access this feature`,
        variant: 'destructive'
      });
    }
  }, [hasAccess, isLoading, requiredRole, toast]);

  return {
    hasAccess,
    isLoading
  };
}
