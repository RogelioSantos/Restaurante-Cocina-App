/**
 * Mock order data for testing the kitchen display system
 */

import { Order, OrderStatus } from '@/types/order';

// Helper to create dates with different time offsets
const minutesAgo = (minutes: number): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date;
};

export const mockOrders: Order[] = [
  // QUEUE ORDERS (En Cola)
  {
    id: 'order-001',
    orderNumber: 47,
    type: 'dine-in',
    tableNumber: 5,
    status: 'queue' as OrderStatus,
    createdAt: minutesAgo(2),
    updatedAt: minutesAgo(2),
    items: [
      {
        id: 'item-001',
        quantity: 3,
        name: 'Tacos al Pastor',
        modifiers: ['Con piña', 'Cilantro y cebolla'],
        completed: false,
      },
      {
        id: 'item-002',
        quantity: 2,
        name: 'Tacos de Asada',
        modifiers: ['Sin cebolla'],
        completed: false,
      },
      {
        id: 'item-003',
        quantity: 2,
        name: 'Agua de Horchata',
        completed: false,
      },
    ],
  },
  {
    id: 'order-002',
    orderNumber: 48,
    type: 'takeout',
    status: 'queue' as OrderStatus,
    createdAt: minutesAgo(4),
    updatedAt: minutesAgo(4),
    items: [
      {
        id: 'item-004',
        quantity: 5,
        name: 'Torta de Milanesa',
        modifiers: ['Extra aguacate', 'Sin jalapeños'],
        completed: false,
      },
      {
        id: 'item-005',
        quantity: 3,
        name: 'Quesadilla de Champiñones',
        completed: false,
      },
      {
        id: 'item-006',
        quantity: 5,
        name: 'Refresco Coca-Cola',
        completed: false,
      },
    ],
  },
  {
    id: 'order-003',
    orderNumber: 49,
    type: 'dine-in',
    tableNumber: 12,
    status: 'queue' as OrderStatus,
    createdAt: minutesAgo(1),
    updatedAt: minutesAgo(1),
    items: [
      {
        id: 'item-007',
        quantity: 1,
        name: 'Enchiladas Verdes',
        modifiers: ['Con crema', 'Queso extra'],
        completed: false,
      },
      {
        id: 'item-008',
        quantity: 1,
        name: 'Frijoles Refritos',
        completed: false,
      },
    ],
  },

  // PREPARING ORDERS (En Preparación)
  {
    id: 'order-004',
    orderNumber: 44,
    type: 'dine-in',
    tableNumber: 3,
    status: 'preparing' as OrderStatus,
    createdAt: minutesAgo(8),
    updatedAt: minutesAgo(3),
    items: [
      {
        id: 'item-009',
        quantity: 2,
        name: 'Burrito de Barbacoa',
        modifiers: ['Extra salsa verde'],
        completed: true,
      },
      {
        id: 'item-010',
        quantity: 1,
        name: 'Orden de Guacamole',
        completed: false,
      },
      {
        id: 'item-011',
        quantity: 2,
        name: 'Cerveza Corona',
        completed: true,
      },
    ],
  },
  {
    id: 'order-005',
    orderNumber: 45,
    type: 'takeout',
    status: 'preparing' as OrderStatus,
    createdAt: minutesAgo(12),
    updatedAt: minutesAgo(6),
    items: [
      {
        id: 'item-012',
        quantity: 4,
        name: 'Tacos de Carnitas',
        modifiers: ['Con todo'],
        completed: true,
      },
      {
        id: 'item-013',
        quantity: 2,
        name: 'Tostadas de Tinga',
        completed: false,
      },
      {
        id: 'item-014',
        quantity: 4,
        name: 'Agua de Jamaica',
        completed: false,
      },
    ],
  },
  {
    id: 'order-006',
    orderNumber: 46,
    type: 'dine-in',
    tableNumber: 8,
    status: 'preparing' as OrderStatus,
    createdAt: minutesAgo(15),
    updatedAt: minutesAgo(7),
    items: [
      {
        id: 'item-015',
        quantity: 1,
        name: 'Carne Asada con Nopales',
        modifiers: ['Término medio', 'Con arroz'],
        completed: false,
      },
      {
        id: 'item-016',
        quantity: 1,
        name: 'Sopa de Tortilla',
        completed: true,
      },
      {
        id: 'item-017',
        quantity: 2,
        name: 'Café Americano',
        completed: true,
      },
    ],
  },
  {
    id: 'order-007',
    orderNumber: 43,
    type: 'dine-in',
    tableNumber: 15,
    status: 'preparing' as OrderStatus,
    createdAt: minutesAgo(22),
    updatedAt: minutesAgo(10),
    items: [
      {
        id: 'item-018',
        quantity: 3,
        name: 'Quesadilla de Flor de Calabaza',
        completed: false,
      },
      {
        id: 'item-019',
        quantity: 1,
        name: 'Chilaquiles Rojos',
        modifiers: ['Con huevo', 'Salsa aparte'],
        completed: false,
      },
      {
        id: 'item-020',
        quantity: 3,
        name: 'Jugo de Naranja Natural',
        completed: false,
      },
    ],
  },

  // READY ORDERS (Listos)
  {
    id: 'order-008',
    orderNumber: 41,
    type: 'takeout',
    status: 'ready' as OrderStatus,
    createdAt: minutesAgo(18),
    updatedAt: minutesAgo(1),
    items: [
      {
        id: 'item-021',
        quantity: 6,
        name: 'Tacos Dorados de Papa',
        modifiers: ['Con lechuga y crema'],
        completed: true,
      },
      {
        id: 'item-022',
        quantity: 2,
        name: 'Salsa Verde',
        completed: true,
      },
      {
        id: 'item-023',
        quantity: 2,
        name: 'Salsa Roja',
        completed: true,
      },
    ],
  },
  {
    id: 'order-009',
    orderNumber: 42,
    type: 'dine-in',
    tableNumber: 7,
    status: 'ready' as OrderStatus,
    createdAt: minutesAgo(20),
    updatedAt: minutesAgo(2),
    items: [
      {
        id: 'item-024',
        quantity: 2,
        name: 'Molcajete Mixto',
        modifiers: ['Para compartir'],
        completed: true,
      },
      {
        id: 'item-025',
        quantity: 1,
        name: 'Orden de Tortillas',
        completed: true,
      },
      {
        id: 'item-026',
        quantity: 2,
        name: 'Michelada',
        completed: true,
      },
    ],
  },
];
