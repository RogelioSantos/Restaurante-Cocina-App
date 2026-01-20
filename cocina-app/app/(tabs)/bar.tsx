import { ordersApi } from '@/api/ordersApi';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import OrderColumn from '@/components/kitchen/OrderColumn';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import useOrdersSocket from '@/hooks/useOrdersSocket';
import { useToast } from '@/hooks/useToast';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, Text, View } from 'react-native';

export default function BarScreen() {
  const {
    orders,
    preparingOrders,
    readyOrders,
    isLoading,
    error,
    refetch,
  } = useOrdersSocket();

  const { toast, showToast, hideToast } = useToast();

  // Acciones para mover órdenes y cancelar
  const { token } = useAuth();
  const [loadingOrderId, setLoadingOrderId] = React.useState<number | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<Map<number, 'queue' | 'ready'>>(new Map());
  const [canceledOrders, setCanceledOrders] = React.useState<Set<number>>(new Set());

  // Calcular órdenes actuales con actualizaciones optimistas aplicadas
  const currentOrders = React.useMemo(() => {
    let result = orders;

    // Aplicar actualizaciones optimistas de estado
    if (optimisticUpdates.size > 0) {
      result = result.map((order) => {
        const optimisticStatus = optimisticUpdates.get(order.id);
        if (optimisticStatus) {
          return { ...order, status: optimisticStatus };
        }
        return order;
      });
    }

    // Filtrar órdenes canceladas (actualización optimista)
    if (canceledOrders.size > 0) {
      result = result.filter((order) => !canceledOrders.has(order.id));
    }

    return result;
  }, [orders, optimisticUpdates, canceledOrders]);

  const currentQueueOrders = React.useMemo(() => {
    const queue = currentOrders.filter((o) => o.status === 'queue');
    // Ordenar por fechaHora (más antiguas primero)
    return [...queue].sort((a, b) => {
      const dateA = new Date(a.fechaHora).getTime();
      const dateB = new Date(b.fechaHora).getTime();
      return dateA - dateB;
    });
  }, [currentOrders]);

  const currentReadyOrders = currentOrders.filter((o) => o.status === 'ready');

  // Limpiar actualizaciones optimistas cuando el WebSocket confirma el cambio
  React.useEffect(() => {
    if (optimisticUpdates.size === 0 && canceledOrders.size === 0) return;

    // Limpiar actualizaciones optimistas de estado
    if (optimisticUpdates.size > 0) {
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        let hasChanges = false;

        prev.forEach((expectedStatus, orderId) => {
          const backendOrder = orders.find((o) => o.id === orderId);
          // Si la orden en el backend ya tiene el estado esperado, limpiar la actualización optimista
          if (backendOrder && backendOrder.status === expectedStatus) {
            newMap.delete(orderId);
            hasChanges = true;
          }
        });

        return hasChanges ? newMap : prev;
      });
    }

    // Limpiar órdenes canceladas optimistas cuando el WebSocket confirma la eliminación
    if (canceledOrders.size > 0) {
      setCanceledOrders((prev) => {
        const newSet = new Set(prev);
        let hasChanges = false;

        prev.forEach((orderId) => {
          // Si la orden ya no está en el array del backend, significa que fue eliminada/cancelada
          const backendOrder = orders.find((o) => o.id === orderId);
          if (!backendOrder) {
            newSet.delete(orderId);
            hasChanges = true;
          }
        });

        return hasChanges ? newSet : prev;
      });
    }
  }, [orders, canceledOrders]);

  const moveToReady = async (orderId: number) => {
    const order = currentQueueOrders.find(o => o.id === orderId);
    if (!order || !token) return;
    setLoadingOrderId(orderId);
    
    // Actualización optimista: mostrar como 'ready' directamente
    setOptimisticUpdates((prev) => new Map(prev).set(orderId, 'ready'));
    
    try {
      // En Barra, las órdenes van directamente de "Solicitado" a "ListoParaEntregar"
      // sin pasar por "En Preparación"
      await ordersApi.updateOrderDetailStatus(token, order.ordenId, [order.id], 'ListoParaEntregar');
      // El WebSocket actualizará el estado, y el efecto limpiará optimisticUpdates
    } catch (err) {
      console.error('Error al mover orden a Listos:', err);
      showToast('Error al mover orden a Listos', 'error');
      // Revertir cambio optimista en caso de error
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(orderId);
        return newMap;
      });
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const order = [...currentQueueOrders, ...currentReadyOrders].find(o => o.id === orderId);
    if (!order || !token) return;

    // No permitir cancelar órdenes que ya están listas
    if (order.status === 'ready') {
      showToast('No se puede cancelar una orden que ya está lista', 'warning');
      return;
    }

    setLoadingOrderId(orderId);

    try {
      // Actualización optimista: marcar la orden como cancelada para que desaparezca inmediatamente
      setCanceledOrders((prev) => new Set(prev).add(orderId));

      // Llamar a la API para cancelar
      await ordersApi.cancelOrderDetail(token, orderId, 'Cancelacion');

      // El WebSocket recibirá el evento con estado "Cancelado" y eliminará la orden automáticamente
      showToast(`Orden "${order.producto}" cancelada`, 'success');
    } catch (err) {
      console.error('Error cancelando orden:', err);
      // Revertir actualización optimista en caso de error
      setCanceledOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      showToast('Error al cancelar la orden', 'error');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const toggleItem = () => {};

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-white mt-4">Cargando pedidos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
      <KitchenHeader />

      {/* Toast de notificaciones */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      {error && (
        <View className="bg-red-500 p-2 mx-4 rounded">
          <Text className="text-white text-center">{error}</Text>
        </View>
      )}

      <View className="flex-1 flex-row gap-2 p-2 px-4 justify-center">
        <OrderColumn
          title="En Cola"
          status="queue"
          orders={currentQueueOrders}
          onToggleItem={toggleItem}
          onMoveToNext={(orderId: number, currentStatus: string) => {
            if (currentStatus === 'queue') {
              moveToReady(orderId);
            }
          }}
          onCancelOrder={handleCancelOrder}
          loadingOrderId={loadingOrderId}
        />
        <OrderColumn
          title="Listos"
          status="ready"
          orders={currentReadyOrders}
          onToggleItem={toggleItem}
          onMoveToNext={(orderId: number, currentStatus: string) => {
            // En "Listos" no hay acciones disponibles
            // El mesero marca como "Entregado" y desaparecen automáticamente
          }}
          onCancelOrder={handleCancelOrder}
          loadingOrderId={loadingOrderId}
        />
      </View>
    </SafeAreaView>
  );
}
