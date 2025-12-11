/**
 * OrderCard component - Complete order card with header, items, and action button
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Order } from '@/types/order';
import OrderItem from './OrderItem';
import TimeAgo from './TimeAgo';

interface OrderCardProps {
  order: Order;
  onToggleItem: (orderId: string, itemId: string) => void;
  onMoveToNext: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onMarkAsDelivered?: (orderId: string) => void;
}

export default function OrderCard({
  order,
  onToggleItem,
  onMoveToNext,
  onConfirmOrder,
  onMarkAsDelivered,
}: OrderCardProps) {
  // Determine priority based on elapsed time
  const getElapsedMinutes = () => {
    const now = new Date();
    return Math.floor((now.getTime() - order.createdAt.getTime()) / 60000);
  };

  const getPriorityColor = () => {
    const elapsed = getElapsedMinutes();
    if (elapsed >= 10) return 'border-priority-urgent';
    if (elapsed >= 5) return 'border-priority-warning';
    return 'border-slate-600';
  };

  const getHeaderColor = () => {
    const elapsed = getElapsedMinutes();
    // Color indicates URGENCY based on time, not status
    if (elapsed >= 10) return 'bg-priority-urgent';      // Red: > 10 minutes (urgent)
    if (elapsed >= 5) return 'bg-priority-warning';      // Yellow: 5-10 minutes (attention)
    return 'bg-status-ready';                             // Green: < 5 minutes (calm)
  };

  const getButtonText = () => {
    switch (order.status) {
      case 'queue':
        return 'Comenzar';
      case 'preparing':
        return 'CONFIRMAR';
      case 'ready':
        return 'ENTREGADO';
      default:
        return 'Siguiente';
    }
  };

  const getButtonColor = () => {
    switch (order.status) {
      case 'preparing':
        return 'bg-primary';
      case 'ready':
        return 'bg-primary border-2 border-white';  // Orange with white border
      default:
        return 'bg-primary';
    }
  };

  const handleButtonPress = () => {
    switch (order.status) {
      case 'queue':
        onMoveToNext(order.id);
        break;
      case 'preparing':
        if (onConfirmOrder) {
          onConfirmOrder(order.id);
        }
        break;
      case 'ready':
        if (onMarkAsDelivered) {
          onMarkAsDelivered(order.id);
        }
        break;
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
            <Text className="text-white font-bold text-2xl mr-3">
              {order.type === 'dine-in'
                ? `Mesa ${order.tableNumber}`
                : 'PARA LLEVAR'}
            </Text>
            <Text className="text-white font-bold text-3xl">
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

      {/* Action button - only show for preparing and ready status */}
      {order.status !== 'queue' && (
        <TouchableOpacity
          onPress={handleButtonPress}
          className={`${getButtonColor()} p-4 items-center justify-center active:opacity-80`}
        >
          <Text className="text-white font-bold text-xl uppercase tracking-wider">
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
