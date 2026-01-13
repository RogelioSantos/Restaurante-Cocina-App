import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Permitir acceso a login, forgot-password, reset-password y must-change-password sin autenticación
    const inAuthGroup = ['login', 'forgot-password', 'reset-password', 'must-change-password'].includes(segments[0]);

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Usuario autenticado y no en páginas de autenticación
      // Verificar si está en la pantalla correcta según su tipo
      if (user?.tipo) {
        const userType = user.tipo.toLowerCase();
        const currentTab = segments[1]; // 'index' o 'bar'
        
        if ((userType === 'barra' || userType === 'bar') && currentTab !== 'bar') {
          router.replace('/(tabs)/bar');
        } else if ((userType !== 'barra' && userType !== 'bar') && currentTab === 'bar') {
          // Si es Cocina/Gerente pero está en Barra, redirigir a Cocina
          router.replace('/(tabs)');
        }
      }
    } else if (isAuthenticated && inAuthGroup) {
      // Usuario autenticado que viene de login/reset, redirigir según tipo
      if (user?.tipo) {
        const userType = user.tipo.toLowerCase();
        if (userType === 'barra' || userType === 'bar') {
          router.replace('/(tabs)/bar');
        } else {
          // Cocina, Gerente, o cualquier otro tipo va a Cocina por defecto
          router.replace('/(tabs)');
        }
      } else {
        // Si no hay tipo de usuario, ir a Cocina por defecto
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, router, user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="must-change-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation:  'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}