/**
 * useOrders hook - Manages order state and transitions between statuses
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Order, OrderStatus, ItemCategory } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';
import { MAX_PREPARING_ORDERS } from '@/constants/kitchen';
import { Alert } from 'react-native';

export function useOrders(category?: ItemCategory) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const shouldAutoMove = useRef(false);

  // Filter orders by category
  const filterOrdersByCategory = useCallback((orders: Order[], category: ItemCategory) => {
    return orders
      .map(order => ({
        ...order,
        items: order.items.filter(item => item.category === category)
      }))
      .filter(order => order.items.length > 0); // Only orders with items of that category
  }, []);

  // Get filtered orders if category is provided
  const filteredOrders = category 
    ? filterOrdersByCategory(orders, category)
    : orders;

  // Toggle individual item completion status
  const toggleItem = useCallback((orderId: string, itemId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          items: order.items.map((item) =>
            item.id === itemId
              ? { ...item, completed: !item.completed }
              : item
          ),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  // Check if all items in an order are completed
  const areAllItemsCompleted = useCallback((order: Order) => {
    return order.items.every(item => item.completed);
  }, []);

  // Auto-move oldest order from queue to preparing when space is available
  const autoMoveToPreparation = useCallback(() => {
    setOrders((prevOrders) => {
      const ordersToCheck = category 
        ? filterOrdersByCategory(prevOrders, category)
        : prevOrders;

      const preparingOrders = ordersToCheck.filter(o => o.status === 'preparing');
      const queueOrders = ordersToCheck.filter(o => o.status === 'queue')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Check if we have space and orders waiting
      if (preparingOrders.length < MAX_PREPARING_ORDERS && queueOrders.length > 0) {
        const oldestQueueOrder = queueOrders[0];
        // TODO: Backend - Recibir nuevos pedidos via WebSocket/API
        return prevOrders.map(o =>
          o.id === oldestQueueOrder.id
            ? { ...o, status: 'preparing' as OrderStatus, updatedAt: new Date() }
            : o
        );
      }

      return prevOrders;
    });
  }, [category, filterOrdersByCategory]);

  // Confirm order from preparing - moves to ready if all items completed
  const confirmOrder = useCallback((orderId: string) => {
    setOrders((prevOrders) => {
      const order = prevOrders.find(o => o.id === orderId);
      if (!order) return prevOrders;

      if (!areAllItemsCompleted(order)) {
        Alert.alert(
          'Items pendientes',
          'Debes marcar todos los items como completados antes de confirmar el pedido.'
        );
        return prevOrders;
      }

      // All items completed - move to ready and show notification
      // TODO: Backend - Enviar notificación al mesero cuando items están listos
      Alert.alert(
        'Notificación enviada',
        'Se ha notificado al mesero que el pedido está listo para recoger.'
      );

      // Mark that we should auto-move on next render
      shouldAutoMove.current = true;
      
      return prevOrders.map(o =>
        o.id === orderId
          ? { ...o, status: 'ready' as OrderStatus, updatedAt: new Date() }
          : o
      );
    });
  }, [areAllItemsCompleted]);

  // Mark order as delivered (simulates waiter confirmation)
  const markAsDelivered = useCallback((orderId: string) => {
    // TODO: Backend - Confirmar entrega del pedido
    Alert.alert(
      'Pedido entregado',
      'El pedido ha sido marcado como entregado. Notificando al sistema...'
    );

    setOrders((prevOrders) => {
      // Mark that we should auto-move on next render
      shouldAutoMove.current = true;
      return prevOrders.filter(o => o.id !== orderId);
    });
  }, []);

  // Move order to next status (for queue orders only now)
  const moveToNextStatus = useCallback((orderId: string) => {
    setOrders((prevOrders) => {
      const order = prevOrders.find((o) => o.id === orderId);
      if (!order) return prevOrders;

      // Queue orders can be manually moved to preparing if space available
      if (order.status === 'queue') {
        const preparingOrders = prevOrders.filter(o => o.status === 'preparing');
        if (preparingOrders.length >= MAX_PREPARING_ORDERS) {
          Alert.alert(
            'Límite alcanzado',
            `No se pueden tener más de ${MAX_PREPARING_ORDERS} pedidos en preparación simultáneamente.`
          );
          return prevOrders;
        }

        return prevOrders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'preparing' as OrderStatus, updatedAt: new Date() }
            : o
        );
      }

      return prevOrders;
    });
  }, []);

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return filteredOrders
        .filter((order) => order.status === status)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    [filteredOrders]
  );

  // Auto-move orders from queue to preparing when component mounts and when orders change
  // TODO: Backend - Sincronizar estado de pedidos en tiempo real
  useEffect(() => {
    const ordersToCheck = category 
      ? filterOrdersByCategory(orders, category)
      : orders;

    const preparingCount = ordersToCheck.filter(o => o.status === 'preparing').length;
    const queueCount = ordersToCheck.filter(o => o.status === 'queue').length;
    
    // Only trigger if we have space and orders waiting, or if explicitly requested
    if ((preparingCount < MAX_PREPARING_ORDERS && queueCount > 0) || shouldAutoMove.current) {
      shouldAutoMove.current = false;
      autoMoveToPreparation();
    }
  }, [orders.length, autoMoveToPreparation, category, filterOrdersByCategory, orders]);

  return {
    orders,
    toggleItem,
    moveToNextStatus,
    confirmOrder,
    markAsDelivered,
    getOrdersByStatus,
  };
}
