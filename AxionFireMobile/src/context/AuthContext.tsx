import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { User } from '../types';
import { authApi } from '../api';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificacionesApi } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (nombre_usuario: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUserData();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotifications = async (userId: string) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '239068a5-d358-4993-a32a-43bf87ca70e7',
      });
      const token = tokenData.data;

      await notificacionesApi.registerToken({
        usuario_id: userId,
        token,
        plataforma: Platform.OS as 'android' | 'ios' | 'web',
      });
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  const login = async (nombre_usuario: string, password: string) => {
    const response = await authApi.login({ nombre_usuario, password });
    const userData: User = { id: response.id, rol: response.rol };

    await storage.setToken(response.token);
    await storage.setUserData(userData);
    await registerForPushNotifications(response.id);

    setToken(response.token);
    setUser(userData);
  };

  const logout = async () => {
    await storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
