import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import { useAuth } from '../../contexts/AuthContext';

type AuthView = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const { authState } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (authState === 'authenticated' && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [authState, navigation]);

  if (view === 'register') {
    return <RegisterScreen onNavigateLogin={() => setView('login')} />;
  }

  return <LoginScreen onNavigateRegister={() => setView('register')} />;
};

export default AuthScreen;
