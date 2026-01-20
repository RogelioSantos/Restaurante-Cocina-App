/**
 * KitchenHeader component - Top header with app name, live clock, and logout button
 */

import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function KitchenHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date. toLocaleTimeString('es-MX', {
      hour:  '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window. confirm) {
      const confirmed = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (confirmed) {
        signOut();
      }
    } else {
      signOut();
    }
  };

  return (
    <View className="bg-slate-800 border-b-2 border-slate-700 px-6 py-3">
      <View className="flex-row justify-between items-center">
        {/* Logo y título */}
        <View className="flex-row items-center">
          <Image 
            source={require('@/assets/images/logo.png')}
            style={{ width: 56, height: 56 }}
            resizeMode="contain"
          />
          <View className="ml-4">
            <Text className="text-white text-3xl font-bold">
              Mesa Libre
            </Text>
            <Text className="text-slate-400 text-sm capitalize">
              {formatDate(currentTime)}
            </Text>
          </View>
        </View>

        {/* Sección derecha:  reloj y logout */}
        <View className="flex-row items-center gap-4">
          {/* Reloj */}
          <View className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-700">
            <Text className="text-white text-2xl font-mono font-bold tracking-wider">
              {formatTime(currentTime)}
            </Text>
          </View>

          {/* Botón de cerrar sesión */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 px-4 py-3 rounded-xl active:bg-red-700"
          >
            <Text className="text-white font-bold text-lg">
              Salir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}