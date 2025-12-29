/**
 * Type definitions for kitchen order management system
 */

export type OrderStatus = 'queue' | 'preparing' | 'ready';
export type OrderType = 'dine-in' | 'takeout';
export type ItemCategory = 'food' | 'beverage';

export interface OrderItem {
  id: string;
  quantity: number;
  name: string;
  modifiers?: string[];
  completed: boolean;
  category: ItemCategory;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  tableNumber?: number; // Only for dine-in orders
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
