import { create } from 'zustand';
import { User, AuthSession, LoginCredentials } from '../types';
import { LocalStorageManager } from '../utils/localStorage';
import { getUserByEmail } from '../mock/data/seeds';
import { SimulationService } from '../services/simulation';
import { SimulationManager } from '../mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setPassword: (token: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  initializeAuth: () => void;
  extendSession: () => void;
  getSessionInfo: () => {
    isValid: boolean;
    expiresAt?: Date;
    sessionStart?: Date;
    lastActivity?: Date;
    pageViews?: number;
    actionsPerformed?: number;
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      // Use simulation service for auth
      await SimulationService.simulateAuth(credentials.email, credentials.password, 'login');

      // Find user by email
      const user = getUserByEmail(credentials.email);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.status !== 'active') {
        throw new Error('Usuario inactivo. Contacte al administrador.');
      }

      // In a real app, we would verify the password hash
      // For demo purposes, we accept any password for existing users
      if (!credentials.password || credentials.password.length < 1) {
        throw new Error('Contraseña requerida');
      }

      // Create session
      const session: AuthSession = {
        user: {
          ...user,
          lastLogin: new Date(),
        },
        token: generateMockToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      // Store session
      LocalStorageManager.setAuthSession(session);

      set({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error de autenticación'
      });
      throw error;
    }
  },

  logout: () => {
    // Perform comprehensive cleanup on logout
    LocalStorageManager.cleanupOnLogout();

    set({
      user: null,
      isAuthenticated: false,
      error: null
    });

    // Note: We avoid importing cleanupStores here to prevent circular dependencies
    // The cleanup will be handled by the component that calls logout
  },

  setPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate network delay
      await SimulationManager.delay();

      // In a real app, we would validate the token and update the password
      // For demo purposes, we just simulate success
      if (!token || token.length < 10) {
        throw new Error('Token inválido o expirado');
      }

      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      set({ isLoading: false });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al establecer contraseña'
      });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate network delay
      await SimulationManager.delay();

      // Check if user exists
      const user = getUserByEmail(email);

      if (!user) {
        // For security, we don't reveal if the email exists or not
        // But we still simulate success
      }

      // Simulate email sending
      set({ isLoading: false });

    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al enviar email de recuperación'
      });
      throw error;
    }
  },

  updateUser: (user: User) => {
    // Update user in state
    set({ user });

    // Update session in localStorage
    const session = LocalStorageManager.getAuthSession() as AuthSession | null;
    if (session) {
      const updatedSession: AuthSession = {
        ...session,
        user
      };
      LocalStorageManager.setAuthSession(updatedSession);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const session = LocalStorageManager.getAuthSession() as AuthSession | null;

    if (session && session.expiresAt && new Date(session.expiresAt) > new Date()) {
      set({
        user: session.user,
        isAuthenticated: true
      });

      // Initialize session metadata
      LocalStorageManager.updateSessionMetadata({
        sessionStart: new Date(),
        lastActivity: new Date(),
      });
    } else {
      // Clear expired session
      LocalStorageManager.clearAuthSession();
      LocalStorageManager.cleanupExpiredData();
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },

  extendSession: () => {
    const session = LocalStorageManager.getAuthSession() as AuthSession | null;
    if (session && session.user) {
      // Extend session by 24 hours
      const extendedSession: AuthSession = {
        ...session,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      LocalStorageManager.setAuthSession(extendedSession);
      LocalStorageManager.updateSessionMetadata({
        lastActivity: new Date(),
      });
    }
  },

  getSessionInfo: () => {
    const session = LocalStorageManager.getAuthSession() as AuthSession | null;
    const metadata = LocalStorageManager.getSessionMetadata() as Record<string, unknown>;

    return {
      isValid: Boolean(session && new Date(session.expiresAt) > new Date()),
      expiresAt: session?.expiresAt,
      sessionStart: metadata.sessionStart as Date | undefined,
      lastActivity: metadata.lastActivity as Date | undefined,
      pageViews: metadata.pageViews as number | undefined,
      actionsPerformed: metadata.actionsPerformed as number | undefined,
    };
  },
}));

function generateMockToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper hooks for specific auth states
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);