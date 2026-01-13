import { ordersApi } from '@/api/ordersApi';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import OrderColumn from '@/components/kitchen/OrderColumn';
import Toast from '@/components/ui/Toast';
import { MAX_PREPARING_ORDERS } from '@/constants/kitchen';
import { useAuth } from '@/context/AuthContext';
import useOrdersSocket from '@/hooks/useOrdersSocket';
import { useToast } from '@/hooks/useToast';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, Text, View } from 'react-native';

export default function KitchenScreen() {
  const {
    orders,
    queueOrders,
    preparingOrders,
    readyOrders,
    isLoading,
    error,
    refetch,
  } = useOrdersSocket();

  const { toast, showToast, hideToast } = useToast();

  // (Ya declarado arriba, eliminar duplicado)
  // (Ya declarado arriba, eliminar duplicado)

  // Acciones manuales reactivadas: PATCH al backend y feedback visual
  const { token } = useAuth();
  const [loadingOrderId, setLoadingOrderId] = React.useState<number | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = React.useState<Map<number, 'queue' | 'preparing' | 'ready'>>(new Map());
  const [canceledOrders, setCanceledOrders] = React.useState<Set<number>>(new Set());
  // TODO: Sistema de movimiento automático (comentado por ahora, puede ser útil en el futuro)
  // const [isAutoMoving, setIsAutoMoving] = React.useState(false);
  // const processingRef = React.useRef(false);
  
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

  const currentPreparingOrders = currentOrders.filter((o) => o.status === 'preparing');
  const currentReadyOrders = currentOrders.filter((o) => o.status === 'ready');
  const canMoveToPreparing = currentPreparingOrders.length < MAX_PREPARING_ORDERS;

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

  // TODO: Sistema de movimiento automático (comentado por ahora, puede ser útil en el futuro)
  // Función para mover automáticamente las órdenes más antiguas de cola a preparación
  // const autoMoveOldestOrders = React.useCallback(async () => {
  //   if (!token || processingRef.current || isAutoMoving) return;
  //   
  //   const availableSpace = MAX_PREPARING_ORDERS - currentPreparingOrders.length;
  //   if (availableSpace <= 0 || currentQueueOrders.length === 0) return;

  //   // Calcular cuántas órdenes mover (no más del espacio disponible)
  //   const ordersToMove = Math.min(availableSpace, currentQueueOrders.length);
  //   const oldestOrders = currentQueueOrders.slice(0, ordersToMove);

  //   if (oldestOrders.length === 0) return;

  //   processingRef.current = true;
  //   setIsAutoMoving(true);

  //   try {
  //     // Mover todas las órdenes en paralelo
  //     await Promise.all(
  //       oldestOrders.map(async (order) => {
  //         try {
  //           // Actualización optimista
  //           setOptimisticUpdates((prev) => new Map(prev).set(order.id, 'preparing'));
  //           // Actualizar en backend
  //           await ordersApi.updateOrderDetailStatus(token, order.ordenId, [order.id], 'EnPreparacion');
  //         } catch (err) {
  //           console.error(`Error moviendo orden ${order.id} automáticamente:`, err);
  //           // Revertir actualización optimista en caso de error
  //           setOptimisticUpdates((prev) => {
  //             const newMap = new Map(prev);
  //             newMap.delete(order.id);
  //             return newMap;
  //           });
  //         }
  //       })
  //     );
  //   } finally {
  //     processingRef.current = false;
  //     setIsAutoMoving(false);
  //   }
  // }, [token, currentPreparingOrders.length, currentQueueOrders, isAutoMoving]);

  // Efecto para mover automáticamente cuando hay espacio disponible
  // React.useEffect(() => {
  //   // Solo mover automáticamente si:
  //   // 1. No hay actualizaciones optimistas pendientes (para evitar conflictos)
  //   // 2. Hay espacio disponible
  //   // 3. Hay órdenes en cola
  //   // 4. No se está procesando ya
  //   if (
  //     optimisticUpdates.size === 0 &&
  //     canMoveToPreparing &&
  //     currentQueueOrders.length > 0 &&
  //     !processingRef.current &&
  //     !isAutoMoving
  //   ) {
  //     // Pequeño delay para evitar ejecutar inmediatamente después de cada cambio
  //     const timer = setTimeout(() => {
  //       autoMoveOldestOrders();
  //     }, 500); // 500ms de delay

  //     return () => clearTimeout(timer);
  //   }
  // }, [canMoveToPreparing, currentQueueOrders.length, optimisticUpdates.size, autoMoveOldestOrders, isAutoMoving]);

  const moveToNextStatus = async (orderId: number, currentStatus: string) => {
    const order = [...currentQueueOrders, ...currentPreparingOrders, ...currentReadyOrders].find(o => o.id === orderId);
    if (!order || !token) return;
    if (currentStatus === 'queue' && !canMoveToPreparing) {
      showToast(`Límite alcanzado (${MAX_PREPARING_ORDERS}). Espera a que se libere un espacio.`, 'warning');
      return;
    }
    setLoadingOrderId(orderId);
    // Actualización optimista: guardar el nuevo estado esperado
    const newStatusApp = currentStatus === 'queue' ? 'preparing' : 'ready';
    setOptimisticUpdates((prev) => new Map(prev).set(orderId, newStatusApp));
    try {
      const newStatusApi = currentStatus === 'queue' ? 'EnPreparacion' : 'ListoParaEntregar';
      await ordersApi.updateOrderDetailStatus(token, order.ordenId, [order.id], newStatusApi);
      // El WebSocket actualizará el estado, y el efecto limpiará optimisticUpdates
    } catch (err) {
      showToast('Error al actualizar estado', 'error');
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

  const confirmOrder = async (orderId: number) => {
    const order = currentPreparingOrders.find(o => o.id === orderId);
    if (!order || !token) return;
    setLoadingOrderId(orderId);
    // Actualización optimista: guardar el nuevo estado esperado
    setOptimisticUpdates((prev) => new Map(prev).set(orderId, 'ready'));
    try {
      await ordersApi.updateOrderDetailStatus(token, order.ordenId, [order.id], 'ListoParaEntregar');
      // El WebSocket actualizará el estado, y el efecto limpiará optimisticUpdates
    } catch (err) {
      showToast('Error al confirmar orden', 'error');
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
    const order = [...currentQueueOrders, ...currentPreparingOrders, ...currentReadyOrders].find(o => o.id === orderId);
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
      // Cuando el WebSocket actualice, también limpiaremos el Set de canceledOrders
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

      <View className="flex-1 flex-row gap-2 p-2 px-4">
        <OrderColumn
          title="En Cola"
          status="queue"
          orders={currentQueueOrders}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
          onCancelOrder={handleCancelOrder}
          isNextColumnFull={!canMoveToPreparing}
          loadingOrderId={loadingOrderId}
        />
        <OrderColumn
          title="En Preparación"
          status="preparing"
          orders={currentPreparingOrders}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
          onConfirmOrder={confirmOrder}
          onCancelOrder={handleCancelOrder}
          maxOrders={MAX_PREPARING_ORDERS}
          loadingOrderId={loadingOrderId}
        />
        <OrderColumn
          title="Listos"
          status="ready"
          orders={currentReadyOrders}
          onToggleItem={toggleItem}
          onMoveToNext={moveToNextStatus}
          loadingOrderId={loadingOrderId}
        />
      </View>
    </SafeAreaView>
  );
}