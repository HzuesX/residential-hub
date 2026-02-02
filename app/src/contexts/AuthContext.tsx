import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { getFullName, rolePermissions } from '@/types';
import { authApi, userApi } from '@/services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  getUserDisplayName: () => string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  apartmentNumber: string;
  buildingName: string;
  societyId: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials for testing (only for development)
const DEMO_CREDENTIALS = {
  societyAdmin: { username: 'admin_society', password: 'Demo@123' },
  societyWorker: { username: 'worker_society', password: 'Demo@123' },
  resident: { username: 'resident_user', password: 'Demo@123' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored auth on mount
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      
      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Silently refresh user data
          await refreshUser().catch(() => {
            // If refresh fails, clear auth
            logout();
          });
        } catch {
          // Invalid stored data, clear it
          logout();
        }
      }
      setIsLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Check for demo credentials
      const isDemoUser = Object.values(DEMO_CREDENTIALS).some(
        cred => cred.username === username && cred.password === password
      );

      if (isDemoUser) {
        // Create mock user for demo
        const mockUser: User = {
          id: 'demo-' + Date.now(),
          userId: 'DEMO001',
          username,
          email: `${username}@demo.com`,
          firstName: username.split('_')[0].charAt(0).toUpperCase() + username.split('_')[0].slice(1),
          lastName: 'Demo',
          phone: '+91 9876543210',
          role: username.includes('admin') ? 'SOCIETY_ADMIN' : 
                username.includes('worker') ? 'SOCIETY_WORKER' : 'RESIDENT',
          apartmentNumber: 'A-101',
          buildingName: 'Tower A',
          societyId: 'demo-society',
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          permissions: [],
          createdAt: new Date().toISOString(),
        };
        
        localStorage.setItem('accessToken', 'demo-token');
        localStorage.setItem('refreshToken', 'demo-refresh-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('societyId', mockUser.societyId || '');
        
        setUser(mockUser);
        toast.success('Demo login successful');
        setIsLoading(false);
        return;
      }

      const response = await authApi.login(username, password);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: userData } = response.data as AuthResponse;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.societyId) {
          localStorage.setItem('societyId', userData.societyId);
        }
        
        setUser(userData);
        toast.success('Login successful');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('societyId');
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user: newUser } = response.data as AuthResponse;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        if (newUser.societyId) {
          localStorage.setItem('societyId', newUser.societyId);
        }
        
        setUser(newUser);
        toast.success('Registration successful');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await userApi.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.role === 'PROJECT_OWNER') return true;
    
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission) || permissions.includes('*');
  }, [user]);

  const checkUsernameAvailability = useCallback(async (username: string): Promise<boolean> => {
    try {
      const response = await userApi.checkUsername(username);
      return response.data === true;
    } catch {
      return false;
    }
  }, []);

  const getUserDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    return getFullName(user);
  }, [user]);

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        hasRole,
        hasPermission,
        checkUsernameAvailability,
        refreshUser,
        getUserDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export demo credentials for reference (only for development)
export { DEMO_CREDENTIALS };
