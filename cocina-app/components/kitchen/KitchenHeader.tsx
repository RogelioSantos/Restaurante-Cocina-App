/**
 * KitchenHeader component - Top header with app name and live clock
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

export default function KitchenHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
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

  return (
    <View className="bg-primary border-b-2 border-primary-dark px-6 py-4">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-3xl font-bold tracking-wide">
            👨‍🍳 RestaurApp Cocina
          </Text>
          <Text className="text-white/80 text-sm mt-1 capitalize">
            {formatDate(currentTime)}
          </Text>
        </View>
        <View className="bg-primary-dark px-6 py-3 rounded-xl border border-white/20">
          <Text className="text-white text-2xl font-mono font-bold tracking-wider">
            {formatTime(currentTime)}
          </Text>
        </View>
      </View>
    </View>
  );
}
