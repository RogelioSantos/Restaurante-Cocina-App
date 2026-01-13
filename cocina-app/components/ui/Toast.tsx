/**
 * Toast component - Notification popup (compact version)
 */

import React, { useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ 
  message, 
  type, 
  visible, 
  onHide, 
  duration = 4000 
}: ToastProps) {
  const translateX = React.useRef(new Animated. Value(350)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      const timer = setTimeout(() => {
        handleHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const handleHide = () => {
    Animated.timing(translateX, {
      toValue: 350,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onHide());
  };

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':  
        return { 
          bg: '#4CAF50',
          title: 'Éxito',
          icon: '✓',
        };
      case 'error':  
        return { 
          bg: '#F44336',
          title: 'Error',
          icon: '! ',
        };
      case 'warning': 
        return { 
          bg: '#FF9800',
          title: 'Aviso',
          icon: '⚠',
        };
      case 'info': 
        return { 
          bg: '#2196F3',
          title: 'Info',
          icon: 'i',
        };
      default: 
        return { 
          bg: '#607D8B', 
          title: 'Aviso',
          icon: '•',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View 
      style={{ 
        transform: [{ translateX }],
        backgroundColor: config.bg,
        position: 'absolute',
        top: 75,
        right: 12,
        zIndex: 9999,
        borderRadius: 6,
        minWidth: 260,
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity:  0.25,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center py-3 px-3">
        {/* Icono - centrado en su contenedor */}
        <View 
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.2)',
            width: 32,
            height: 32,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text className="text-white text-base font-bold">{config.icon}</Text>
        </View>

        {/* Contenido */}
        <View className="flex-1 mr-2">
          <Text className="text-white font-bold text-sm">{config.title}</Text>
          <Text className="text-white/90 text-xs" numberOfLines={2}>{message}</Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity 
          onPress={handleHide}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left:  8, right: 8 }}
        >
          <Text className="text-white/70 text-xl">×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}