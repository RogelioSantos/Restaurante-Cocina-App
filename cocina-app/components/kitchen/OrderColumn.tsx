/**
 * OrderColumn component - Kanban column for displaying orders
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Order, OrderStatus } from '@/types/order';
import OrderCard from './OrderCard';

interface OrderColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onToggleItem: (orderId: string, itemId: string) => void;
  onMoveToNext: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onMarkAsDelivered?: (orderId: string) => void;
  maxOrders?: number;
}

export default function OrderColumn({
  title,
  status,
  orders,
  onToggleItem,
  onMoveToNext,
  onConfirmOrder,
  onMarkAsDelivered,
  maxOrders,
}: OrderColumnProps) {
  const getHeaderColor = () => {
    // Column headers should be neutral - urgency is shown on cards
    return 'bg-slate-700';
  };

  return (
    <View className="flex-1 min-w-[320px] max-w-[450px]">
      {/* Column header */}
      <View className={`${getHeaderColor()} rounded-t-xl p-4 mx-2`}>
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-bold text-xl">{title}</Text>
          <View className="bg-black/30 px-3 py-1 rounded-full">
            <Text className="text-white font-bold text-lg">
              {maxOrders ? `${orders.length}/${maxOrders}` : orders.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Orders list */}
      <ScrollView
        className="flex-1 px-2 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {orders.length === 0 ? (
          <View className="p-6 items-center justify-center">
            <Text className="text-slate-500 text-lg text-center">
              No hay pedidos {status === 'queue' ? 'en cola' : status === 'preparing' ? 'en preparación' : 'listos'}
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onToggleItem={onToggleItem}
              onMoveToNext={onMoveToNext}
              onConfirmOrder={onConfirmOrder}
              onMarkAsDelivered={onMarkAsDelivered}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
