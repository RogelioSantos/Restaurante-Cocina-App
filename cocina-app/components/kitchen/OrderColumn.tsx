/**
 * OrderColumn component - Kanban column for displaying orders
 */

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import OrderCard from './OrderCard';

interface Order {
  id: number;
  ordenId: number;
  producto: string;
  cantidad: number;
  status: 'queue' | 'preparing' | 'ready';
  fechaHora: string;
  comentario:  string | null;
  complementos: string[];
  exclusiones: string[];
  fechaHoraInicioEstado: string | null;
  mesaId: number;
}

type OrderStatus = 'queue' | 'preparing' | 'ready';

interface OrderColumnProps {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onToggleItem: (orderId: number, itemId:  number) => void;
  onMoveToNext: (orderId: number, status: string) => void;
  onConfirmOrder?:  (orderId: number) => void;
  onCancelOrder?:  (orderId: number) => void;
  maxOrders?: number;
  isNextColumnFull?: boolean;
  hideActionButton?: boolean; // Para ocultar el botón de acción en Barra
}

export default function OrderColumn({
  title,
  status,
  orders,
  onToggleItem,
  onMoveToNext,
  onConfirmOrder,
  onCancelOrder,
  maxOrders,
  isNextColumnFull,
  loadingOrderId,
  hideActionButton = false,
}: OrderColumnProps & { loadingOrderId?: number | null }) {
  
  const getHeaderColor = () => {
    // Si es la columna "En Cola" y la siguiente está llena, mostrar advertencia
    if (status === 'queue' && isNextColumnFull) {
      return 'bg-amber-700';
    }
    // Si es "En Preparación" y está llena
    if (maxOrders && orders.length >= maxOrders) {
      return 'bg-red-700';
    }
    return 'bg-slate-700';
  };

  const getCounterColor = () => {
    if (maxOrders && orders.length >= maxOrders) {
      return 'bg-red-500';
    }
    return 'bg-black/30';
  };

  return (
    <View className="flex-1 min-w-[320px] max-w-[450px]">
      {/* Column header */}
      <View className={`${getHeaderColor()} rounded-t-xl p-4 mx-2`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-xl">{title}</Text>
            {/* Indicador de columna llena */}
            {status === 'queue' && isNextColumnFull && (
              <Text className="text-yellow-200 text-sm ml-2">⚠️ Preparación llena</Text>
            )}
          </View>
          <View className={`${getCounterColor()} px-3 py-1 rounded-full`}>
            <Text className="text-white font-bold text-lg">
              {maxOrders ?  `${orders.length}/${maxOrders}` : orders.length}
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
              onCancelOrder={onCancelOrder}
              isActionDisabled={status === 'queue' && isNextColumnFull}
              isLoading={loadingOrderId === order.id}
              hideActionButton={hideActionButton}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}