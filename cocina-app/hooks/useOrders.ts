import { useCallback, useEffect, useRef, useState } from "react";
import { OrderDetail, ordersApi } from "../api/ordersApi";
import { POLLING_INTERVAL } from "../constants/api";
import { useAuth } from "../context/AuthContext";

export type OrderStatus = "queue" | "preparing" | "ready";

export interface Order {
  id:  number;
  ordenId: number;
  producto: string;
  cantidad: number;
  status: OrderStatus;
  fechaHora: string;
  comentario: string | null;
  complementos: string[];
  exclusiones: string[];
  fechaHoraInicioEstado: string | null;
  mesaId: number;
  numeroOrden?: number;
  tipoOrden?: string;
}

interface UseOrdersReturn {
  orders: Order[];
  queueOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrderStatus: (orderId: number, orderDetailId: number, newStatus: string) => Promise<void>;
  cancelOrder: (orderDetailId: number) => Promise<void>;
}

const mapApiStatusToAppStatus = (apiStatus:  string): OrderStatus | null => {
  const normalizedStatus = apiStatus.toLowerCase().trim();

  if (normalizedStatus === "solicitado") {
    return "queue";
  }
  if (
    normalizedStatus === "en preparación" ||
    normalizedStatus === "en preparacion" ||
    normalizedStatus === "enpreparacion"
  ) {
    return "preparing";
  }
  if (
    normalizedStatus === "listo para entregar" ||
    normalizedStatus === "listoparaentregar"
  ) {
    return "ready";
  }
  if (normalizedStatus === "entregado" || normalizedStatus === "cancelado") {
    return null;
  }

  console.warn("Estado no reconocido:", apiStatus);
  return null;
};

const mapAppStatusToApiStatus = (appStatus: string): string => {
  const statusMap:  Record<string, string> = {
    queue: "Solicitado",
    preparing: "EnPreparacion",
    ready:  "ListoParaEntregar",
    delivered: "Entregado",
  };
  return statusMap[appStatus] || appStatus;
};

// Recibe el objeto de detalle y el objeto de orden completo para extraer los campos globales
const transformOrderDetail = (detail: OrderDetail, parentOrder?: any): Order | null => {
  const status = mapApiStatusToAppStatus(detail.estado);
  if (status === null) return null;

  return {
    id: detail.id,
    ordenId: detail.ordenId,
    producto: detail.producto,
    cantidad: detail.cantidad,
    status,
    fechaHora: detail.fechaHora,
    comentario: detail.comentario,
    complementos: detail.complementos || [],
    exclusiones: detail.exclusiones || [],
    fechaHoraInicioEstado: detail.fechaHoraInicioEstado,
    mesaId: detail.mesaId,
    numeroOrden: parentOrder?.numeroOrden,
    tipoOrden: parentOrder?.tipoOrden,
  };
};

export const useOrders = (): UseOrdersReturn => {
  const { token, refreshAuthToken, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sistema de bloqueo temporal para evitar que el polling revierta cambios
  const recentlyModifiedIds = useRef<Set<number>>(new Set());
  const modificationTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Marcar orden como modificada (ignorar polling por 10 segundos)
  const markAsModified = useCallback((orderId: number) => {
    recentlyModifiedIds.current. add(orderId);

    // Limpiar timer anterior si existe
    const existingTimer = modificationTimers.current.get(orderId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Remover después de 10 segundos (2 ciclos de polling de 5s)
    const timer = setTimeout(() => {
      recentlyModifiedIds.current.delete(orderId);
      modificationTimers.current.delete(orderId);
    }, 10000);

    modificationTimers.current. set(orderId, timer);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const orderDetails = await ordersApi.getOrderDetails(token);

      // orderDetails es un array plano, pero necesitamos los datos globales de la orden
      // Por lo tanto, mejor obtener los datos desde el mapeo en api/ordersApi.ts
      // Si no, aquí no se puede arreglar. Si orderDetails no tiene los campos, hay que arreglar el mapeo en api/ordersApi.ts
      // Por compatibilidad, intentamos mapear si los campos existen
      const transformed = orderDetails
        .map((detail: any) => transformOrderDetail(detail, detail))
        .filter((order): order is Order => order !== null);

      // Aplicar filtro de órdenes modificadas recientemente
      setOrders((prevOrders) => {
        const modifiedIds = recentlyModifiedIds.current;

        // Si no hay modificaciones recientes, usar datos del servidor directamente
        if (modifiedIds.size === 0) {
          return transformed;
        }

        // Mantener el estado local de las órdenes modificadas recientemente
        const serverOrdersFiltered = transformed.filter(
          (order) => ! modifiedIds.has(order. id)
        );
        const localModifiedOrders = prevOrders. filter(
          (order) => modifiedIds.has(order.id)
        );

        return [...serverOrdersFiltered, ... localModifiedOrders];
      });
    } catch (err) {
      console.error("Error fetching orders:", err);

      if (err instanceof Error && err. message.includes("401")) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          await fetchOrders();
          return;
        }
      }

      setError(err instanceof Error ? err.message :  "Error al obtener órdenes");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, refreshAuthToken]);

  const updateOrderStatus = useCallback(
    async (ordenId: number, orderDetailId:  number, newStatus: string) => {
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Marcar como modificada ANTES de hacer cambios
      markAsModified(orderDetailId);

      // Actualización optimista inmediata
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderDetailId ?  { ...order, status: newStatus as OrderStatus } : order
        )
      );

      try {
        const apiStatus = mapAppStatusToApiStatus(newStatus);
        await ordersApi. updateOrderDetailStatus(token, ordenId, [orderDetailId], apiStatus);
      } catch (err) {
        console.error("Error updating order status:", err);
        // Quitar de modificados para que el polling corrija
        recentlyModifiedIds.current. delete(orderDetailId);
        await fetchOrders();
        throw err;
      }
    },
    [token, fetchOrders, markAsModified]
  );

  const cancelOrder = useCallback(
    async (orderDetailId: number) => {
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Marcar como modificada
      markAsModified(orderDetailId);

      // Remover la orden de la lista local inmediatamente
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderDetailId)
      );

      try {
        await ordersApi.cancelOrderDetail(token, orderDetailId);
      } catch (err) {
        console.error("Error canceling order:", err);
        // Quitar de modificados para que el polling corrija
        recentlyModifiedIds.current.delete(orderDetailId);
        await fetchOrders();
        throw err;
      }
    },
    [token, fetchOrders, markAsModified]
  );

  // Carga inicial
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling
  useEffect(() => {
    if (! isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchOrders();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchOrders]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      modificationTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const queueOrders = orders.filter((order) => order.status === "queue");
  const preparingOrders = orders. filter((order) => order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready");

  return {
    orders,
    queueOrders,
    preparingOrders,
    readyOrders,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    cancelOrder,
  };
};

export default useOrders;