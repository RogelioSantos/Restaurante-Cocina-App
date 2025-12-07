/**
 * useOrders hook - Manages order state and transitions between statuses
 */

import { useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { mockOrders } from '@/data/mockOrders';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

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

  // Move order to next status
  const moveToNextStatus = useCallback((orderId: string) => {
    setOrders((prevOrders) => {
      const order = prevOrders.find((o) => o.id === orderId);
      if (!order) return prevOrders;

      let newStatus: OrderStatus;
      switch (order.status) {
        case 'queue':
          newStatus = 'preparing';
          break;
        case 'preparing':
          newStatus = 'ready';
          break;
        case 'ready':
          // Remove order from list when marked as delivered
          return prevOrders.filter((o) => o.id !== orderId);
        default:
          return prevOrders;
      }

      return prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date() }
          : o
      );
    });
  }, []);

  // Get orders by status
  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return orders
        .filter((order) => order.status === status)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    [orders]
  );

  return {
    orders,
    toggleItem,
    moveToNextStatus,
    getOrdersByStatus,
  };
}
