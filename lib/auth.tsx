import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, queryClient } from './queryClient';
import type { UserWithoutPassword } from '@shared/schema';

interface AuthContextType {
  user: UserWithoutPassword | null;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<string>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('sessionId');
  });
  const [isLoading, setIsLoading] = useState(true);
  const [consecutiveAuthErrors, setConsecutiveAuthErrors] = useState(0);

  useEffect(() => {
    // Auto-login en mode test avec ?testmode=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('testmode') === '1' && !sessionId) {
      setIsLoading(true);
      login('rulianopremier@gmail.com', 'Magamelle1!')
        .catch(() => {
          console.log('Test mode login failed, showing login page');
          setIsLoading(false);
        });
      return;
    }

    if (sessionId) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setConsecutiveAuthErrors(0); // Reset error counter on success
      } else if (response.status === 401) {
        // Don't clear user on temporary 401 errors
        // Just increment error counter silently
        setConsecutiveAuthErrors(prev => {
          const newCount = prev + 1;
          // Only logout after 3 consecutive 401 errors
          if (newCount >= 3) {
            localStorage.removeItem('sessionId');
            setSessionId(null);
            setUser(null);
          }
          return newCount;
        });
      } else {
        // For other errors, reset counter but keep user
        setConsecutiveAuthErrors(0);
      }
    } catch (error) {
      // Network errors - don't clear anything, just reset counter
      setConsecutiveAuthErrors(0);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Échec de la connexion');
    }

    setUser(data.user);
    setSessionId(data.sessionId);
    localStorage.setItem('sessionId', data.sessionId);
  };

  const signup = async (email: string, password: string, name: string): Promise<string> => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Échec de l\'inscription');
    }

    return data.message;
  };

  const logout = async () => {
    if (sessionId) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('sessionId');
    setSessionId(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
