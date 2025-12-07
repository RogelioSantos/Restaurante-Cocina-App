import React from 'react';
import { SafeAreaView, View, StatusBar } from 'react-native';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import OrderColumn from '@/components/kitchen/OrderColumn';
import { useOrders } from '@/hooks/useOrders';

export default function KitchenScreen() {
  const { toggleItem, moveToNextStatus, getOrdersByStatus } = useOrders();

  return (
    <SafeAreaView className="flex-1 bg-kitchen-bg">
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* Header */}
      <KitchenHeader />

      {/* Kanban Board - 3 Columns */}
      <View className="flex-1 flex-row gap-2 p-2">
        {/* Queue Column */}
        <OrderColumn
          title="En Cola"
          status="queue"
          orders={getOrdersByStatus('queue')}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
        />

        {/* Preparing Column */}
        <OrderColumn
          title="En Preparación"
          status="preparing"
          orders={getOrdersByStatus('preparing')}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
        />

        {/* Ready Column */}
        <OrderColumn
          title="Listos"
          status="ready"
          orders={getOrdersByStatus('ready')}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
        />
      </View>
    </SafeAreaView>
  );
}
