import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};

export const storage = {
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },

  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  setUserData: async (data: any): Promise<void> => {
    await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  },

  getUserData: async (): Promise<any | null> => {
    const data = await AsyncStorage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  removeUserData: async (): Promise<void> => {
    await AsyncStorage.removeItem(KEYS.USER_DATA);
  },

  clear: async (): Promise<void> => {
    await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER_DATA]);
  },
};
