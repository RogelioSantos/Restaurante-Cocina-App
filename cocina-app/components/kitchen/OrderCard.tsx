/**
 * OrderCard component - Complete order card with header, items, and action button
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order, OrderStatus } from '@/types/order';
import OrderItem from './OrderItem';
import TimeAgo from './TimeAgo';

interface OrderCardProps {
  order: Order;
  onToggleItem: (orderId: string, itemId: string) => void;
  onMoveToNext: (orderId: string) => void;
}

export default function OrderCard({
  order,
  onToggleItem,
  onMoveToNext,
}: OrderCardProps) {
  // Determine priority based on elapsed time
  const getElapsedMinutes = () => {
    const now = new Date();
    return Math.floor((now.getTime() - order.createdAt.getTime()) / 60000);
  };

  const getPriorityColor = () => {
    const elapsed = getElapsedMinutes();
    if (elapsed >= 20) return 'border-priority-urgent';
    if (elapsed >= 10) return 'border-priority-warning';
    return 'border-slate-600';
  };

  const getHeaderColor = () => {
    const elapsed = getElapsedMinutes();
    if (elapsed >= 20) return 'bg-priority-urgent';
    if (elapsed >= 10) return 'bg-priority-warning';
    
    // Status colors
    switch (order.status) {
      case 'queue':
        return 'bg-status-queue';
      case 'preparing':
        return 'bg-status-preparing';
      case 'ready':
        return 'bg-status-ready';
      default:
        return 'bg-slate-700';
    }
  };

  const getButtonText = () => {
    switch (order.status) {
      case 'queue':
        return 'Comenzar';
      case 'preparing':
        return 'Marcar Listo';
      case 'ready':
        return 'Entregado';
      default:
        return 'Siguiente';
    }
  };

  const getButtonColor = () => {
    switch (order.status) {
      case 'queue':
        return 'bg-status-preparing';
      case 'preparing':
        return 'bg-status-ready';
      case 'ready':
        return 'bg-slate-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <View
      className={`bg-kitchen-surface rounded-2xl border-2 ${getPriorityColor()} overflow-hidden shadow-lg mb-4`}
    >
      {/* Header */}
      <View className={`${getHeaderColor()} p-4`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-2xl mr-2">
              {order.type === 'dine-in' ? '🍽️' : '📦'}
            </Text>
            <Text className="text-white font-bold text-2xl">
              {order.type === 'dine-in'
                ? `Mesa ${order.tableNumber}`
                : 'PARA LLEVAR'}
            </Text>
          </View>
          <View className="bg-black/30 px-3 py-1.5 rounded-lg">
            <Text className="text-white font-bold text-lg">
              #{order.orderNumber}
            </Text>
          </View>
        </View>
        <View className="mt-2">
          <TimeAgo
            date={order.createdAt}
            className="text-white/90 font-semibold text-base"
          />
        </View>
      </View>

      {/* Items list */}
      <View className="p-3">
        {order.items.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            onToggle={(itemId) => onToggleItem(order.id, itemId)}
          />
        ))}
      </View>

      {/* Action button */}
      <TouchableOpacity
        onPress={() => onMoveToNext(order.id)}
        className={`${getButtonColor()} p-4 items-center justify-center active:opacity-80`}
      >
        <Text className="text-white font-bold text-xl uppercase tracking-wider">
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
