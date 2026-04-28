import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)" />;

  return <Redirect href="/(home)/home" />;
}
