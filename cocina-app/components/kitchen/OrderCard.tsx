/**
 * OrderCard component - Order card with header, product info, and action buttons
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Order {
  id: number;
  ordenId: number;
  producto: string;
  cantidad: number;
  status: 'queue' | 'preparing' | 'ready';
  fechaHora: string;
  comentario: string | null;
  complementos: string[];
  exclusiones: string[];
  fechaHoraInicioEstado: string | null;
  mesaId: number;
  numeroOrden?: number;
  tipoOrden?: string;
}

interface OrderCardProps {
  order: Order;
  onToggleItem: (orderId:  number, itemId: number) => void;
  onMoveToNext: (orderId: number, status: string) => void;
  onConfirmOrder?: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  isActionDisabled?: boolean;
  isLoading?: boolean;
  hideActionButton?: boolean; // Para ocultar el botón de acción en Barra
}

export default function OrderCard({
  order,
  onToggleItem,
  onMoveToNext,
  onConfirmOrder,
  onCancelOrder,
  isActionDisabled = false,
  isLoading = false,
  hideActionButton = false,
}: OrderCardProps) {

  
  const getElapsedMinutes = () => {
    if (! order.fechaHora) return 0;
    try {
      const orderDate = new Date(order.fechaHora);
      const now = new Date();
      const diffMs = now.getTime() - orderDate.getTime();
      return Math.floor(diffMs / 60000);
    } catch {
      return 0;
    }
  };

  const getElapsedDisplay = () => {
    const mins = getElapsedMinutes();
    if (mins < 0) return '0 min';
    if (mins > 60) return '60+ min';
    return `${mins} min`;
  };

  const getPriorityColor = () => {
    const elapsed = getElapsedMinutes();
    if (elapsed >= 10) return 'border-red-500';
    if (elapsed >= 5) return 'border-yellow-500';
    return 'border-slate-600';
  };

  const getHeaderColor = () => {
    const elapsed = getElapsedMinutes();
    if (elapsed >= 10) return 'bg-red-500';
    if (elapsed >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getButtonText = () => {
    switch (order.status) {
      case 'queue':
        return isActionDisabled ?  'ESPERAR.. .' : 'COMENZAR';
      case 'preparing':
        return 'LISTO';
      default:
        return '';
    }
  };

  const getButtonColor = () => {
    if (isActionDisabled) {
      return 'bg-gray-500';
    }
    switch (order.status) {
      case 'queue':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-green-500';
      default: 
        return 'bg-gray-500';
    }
  };

  const handleButtonPress = () => {
    if (isActionDisabled) return;
    
    switch (order.status) {
      case 'queue':
        onMoveToNext(order.id, order.status);
        break;
      case 'preparing':
        if (onConfirmOrder) {
          onConfirmOrder(order. id);
        }
        break;
    }
  };

  const handleCancelPress = () => {
    if (onCancelOrder) {
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm(`¿Cancelar "${order.producto}" de Mesa ${order.mesaId}? `);
        if (confirmed) {
          onCancelOrder(order.id);
        }
      } else {
        onCancelOrder(order.id);
      }
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const canCancel = order.status === 'queue' || order.status === 'preparing';
  const showActionButton = !hideActionButton && order.status !== 'ready';

  return (
    <View
      className={`bg-slate-800 rounded-2xl border-2 ${getPriorityColor()} overflow-hidden shadow-lg mb-4 ${isActionDisabled ? 'opacity-70' : ''}`}
    >
      {/* Header */}
      <View className={`${getHeaderColor()} p-4`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Text className="text-white font-bold text-2xl mr-2">🍽️</Text>
            <View>
              <Text className="text-white font-bold text-xl">
                Mesa {order.mesaId}
              </Text>
              {order.tipoOrden && (
                <Text
                  className="text-white text-base font-extrabold mt-1 drop-shadow-sm"
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.7)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  {order.tipoOrden}
                </Text>
              )}
            </View>
            <Text className="text-white font-bold text-lg ml-4">
              #{order.numeroOrden ?? order.id}
            </Text>
          </View>
          
          {/* Botón cancelar */}
          {canCancel && onCancelOrder && (
            <TouchableOpacity
              onPress={handleCancelPress}
              className="bg-slate-900/80 border-2 border-white/50 w-9 h-9 rounded-lg items-center justify-center active:bg-slate-700"
            >
              <Text className="text-white font-bold text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-white/90 font-semibold text-sm">
            {formatTime(order.fechaHora)}
          </Text>
          <Text className="text-white/90 font-semibold text-sm">
             {getElapsedDisplay()} 
          </Text>
        </View>
      </View>

      {/* Producto */}
      <View className="p-4">
        <View className="flex-row items-center">
          <Text className="text-white text-lg flex-1 font-semibold">
            {order.producto}
          </Text>
          <View className="bg-slate-700 px-3 py-1 rounded-full">
            <Text className="text-white font-bold">x{order.cantidad}</Text>
          </View>
        </View>

        {/* Complementos */}
        {order. complementos && order.complementos.length > 0 && (
          <View className="mt-2">
            {order.complementos.map((complemento, index) => (
              <View key={index} className="flex-row items-center mt-1">
                <Text className="text-green-400 text-sm">＋ {complemento}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Exclusiones */}
        {order.exclusiones && order.exclusiones.length > 0 && (
          <View className="mt-2">
            {order.exclusiones.map((exclusion, index) => (
              <View key={index} className="flex-row items-center mt-1">
                <Text className="text-red-400 text-sm">− {exclusion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Comentario */}
        {order. comentario && (
          <Text className="text-yellow-400 text-sm mt-2 italic">
            💬 {order.comentario}
          </Text>
        )}
      </View>

      {/* Action button */}
      {showActionButton && (
        <TouchableOpacity
          onPress={handleButtonPress}
          disabled={isActionDisabled || isLoading}
          className={`${getButtonColor()} p-4 items-center justify-center ${(isActionDisabled || isLoading) ? 'opacity-70' : 'active:opacity-80'}`}
        >
          <Text className="text-white font-bold text-xl uppercase tracking-wider">
            {isLoading ? 'Enviando...' : getButtonText()}
          </Text>
        </TouchableOpacity>
      )}

      {/* Indicador para "Listos" */}
      {order.status === 'ready' && (
        <View className="bg-slate-700 p-3 items-center">
          <Text className="text-slate-300 text-sm">
            ⏳ Esperando mesero...
          </Text>
        </View>
      )}
    </View>
  );
}