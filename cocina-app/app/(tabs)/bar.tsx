import React from 'react';
import { SafeAreaView, View, StatusBar } from 'react-native';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import OrderColumn from '@/components/kitchen/OrderColumn';
import { useOrders } from '@/hooks/useOrders';

export default function BarScreen() {
  const { toggleItem, moveToNextStatus, confirmOrder, markAsDelivered, getOrdersByStatus } = useOrders('beverage');

  return (
    <SafeAreaView className="flex-1 bg-kitchen-bg">
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <KitchenHeader />

      {/* Kanban Board - 2 Columns (No Queue for Bar) */}
      <View className="flex-1 flex-row gap-2 p-2 px-4 justify-center">
        {/* Preparing Column */}
        <OrderColumn
          title="En Preparación"
          status="preparing"
          orders={getOrdersByStatus('preparing')}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
          onConfirmOrder={confirmOrder}
        />

        {/* Ready Column */}
        <OrderColumn
          title="Listos"
          status="ready"
          orders={getOrdersByStatus('ready')}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
          onMarkAsDelivered={markAsDelivered}
        />
      </View>
    </SafeAreaView>
  );
}
