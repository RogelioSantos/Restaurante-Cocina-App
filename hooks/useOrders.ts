import { useState, useEffect, useCallback } from "react";
import { ordersApi, OrderDetail } from "../api/ordersApi";
import { useAuth } from "../context/AuthContext";
import { POLLING_INTERVAL } from "../constants/api";

export type OrderStatus = "queue" | "preparing" | "ready";

export interface Order {
  id: number;
  producto: string;
  status: OrderStatus;
  fechaHora: string;
  empleado: string;
  fechaHoraInicioEstado: string;
  mesaId: number;
  tipoCategoria?: "Alimentos" | "Bebidas";
}

interface UseOrdersOptions {
  tipoCategoria: "Alimentos" | "Bebidas";
}

interface UseOrdersReturn {
  orders: Order[];
  queueOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrderStatus: (
    orderId: number,
    newStatus: OrderStatus
  ) => Promise<void>;
}

// Mapeo de estados de la API a estados de la app
const mapApiStatusToAppStatus = (
  apiStatus: OrderDetail["estado"]
): OrderStatus | null => {
  const statusMap: Record<OrderDetail["estado"], OrderStatus | null> = {
    Solicitado: "queue",
    EnPreparacion: "preparing",
    ListoParaEntregar: "ready",
    Entregado: null, // No mostrar
    Cancelado: null, // No mostrar
  };
  return statusMap[apiStatus];
};

// Mapeo de estados de la app a estados de la API
const mapAppStatusToApiStatus = (
  appStatus: OrderStatus
): OrderDetail["estado"] => {
  const statusMap: Record<OrderStatus, OrderDetail["estado"]> = {
    queue: "Solicitado",
    preparing: "EnPreparacion",
    ready: "ListoParaEntregar",
  };
  return statusMap[appStatus];
};

// Transformar OrderDetail de la API a Order de la app
const transformOrderDetail = (detail: OrderDetail): Order | null => {
  const status = mapApiStatusToAppStatus(detail.estado);
  if (status === null) return null;

  return {
    id: detail.id,
    producto: detail.producto,
    status,
    fechaHora: detail.fechaHora,
    empleado: detail.empleado,
    fechaHoraInicioEstado: detail.fechaHoraInicioEstado,
    mesaId: detail.mesaId,
    tipoCategoria: detail.tipoCategoria,
  };
};

export const useOrders = (options: UseOrdersOptions): UseOrdersReturn => {
  const { tipoCategoria } = options;
  const { token, refreshAuthToken, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const orderDetails = await ordersApi.getOrderDetails(token);

      // Filtrar por categoría y transformar
      const filteredAndTransformed = orderDetails
        .filter((detail) => detail.tipoCategoria === tipoCategoria)
        .map(transformOrderDetail)
        .filter((order): order is Order => order !== null);

      setOrders(filteredAndTransformed);
    } catch (err) {
      console.error("Error fetching orders:", err);

      // Intentar refrescar el token si hay error de autenticación
      if (err instanceof Error && err.message.includes("401")) {
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          // Reintentar la petición
          await fetchOrders();
          return;
        }
      }

      setError(err instanceof Error ? err.message : "Error al obtener órdenes");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, tipoCategoria, refreshAuthToken]);

  const updateOrderStatus = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      try {
        const apiStatus = mapAppStatusToApiStatus(newStatus);
        await ordersApi.updateOrderDetailStatus(
          token,
          orderId,
          [orderId],
          apiStatus
        );

        // Actualizar el estado local optimísticamente
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } catch (err) {
        console.error("Error updating order status:", err);
        // Refetch para sincronizar con el servidor
        await fetchOrders();
        throw err;
      }
    },
    [token, fetchOrders]
  );

  // Cargar órdenes inicialmente
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Polling para actualizar órdenes
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchOrders();
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchOrders]);

  // Filtrar órdenes por estado
  const queueOrders = orders.filter((order) => order.status === "queue");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  );
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
  };
};

export default useOrders;
