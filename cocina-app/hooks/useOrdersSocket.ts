import { useCallback, useEffect, useRef, useState } from "react";
import { OrderDetail, ordersApi } from "../api/ordersApi";
import { useAuth } from "../context/AuthContext";
import { Order, OrderStatus } from "./useOrders";

interface UseOrdersSocketReturn {
  orders: Order[];
  queueOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface WebSocketEvent<T> {
  eventType: string;
  data: T;
}

interface OrderDetailsUpdateResponseDTO {
  detallesIds: number[];
  estadoNuevo: string;
}

const WS_BASE_URL = "ws://137.184.191.81/ws/orders";

export const useOrdersSocket = (): UseOrdersSocketReturn => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // DEBUG: Confirm hook is being used
  console.log('[WS] useOrdersSocket hook activo');
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

  // GET inicial
  const fetchOrders = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      setIsLoading(true);
      const orderDetails = await ordersApi.getOrderDetails(token);
      const transformed = orderDetails
        .map((detail: any) => transformOrderDetail(detail, detail))
        .filter((order): order is Order => order !== null);
      setOrders(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener órdenes");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  // WebSocket connection
  useEffect(() => {
    if (!token || !isAuthenticated) return;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let manuallyClosed = false;

    // En React Native no se pueden enviar headers, así que el token va por query param
    const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Conectado a WebSocket:', wsUrl);
      };
      ws.onclose = () => {
        console.log('[WS] WebSocket cerrado');
        if (!manuallyClosed) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
      ws.onerror = (e) => {
        console.log('[WS] Error en WebSocket:', e);
        setError("Error en WebSocket");
      };
      ws.onmessage = (event) => {
        console.log('[WS] Mensaje recibido:', event.data);
        try {
          const msg = JSON.parse(event.data) as WebSocketEvent<any>;
          if (msg.eventType === "NUEVA_ORDEN") {
            console.log('[WS] NUEVA_ORDEN recibida:', msg.data);
            // data es un objeto OrdenAPI (similar a lo que viene del GET)
            // Tiene estructura: { ordenId, numeroOrden, tipoOrden, detallesOrden[], fechaHora, estado, mesaId }
            const ordenData = msg.data as any;
            
            if (!ordenData.detallesOrden || !Array.isArray(ordenData.detallesOrden)) {
              console.warn('[WS] NUEVA_ORDEN con estructura incorrecta:', ordenData);
              return;
            }
            
            // Transformar los detallesOrden a Order, similar a como lo hace getOrderDetails
            const transformed = ordenData.detallesOrden
              .map((detalle: any): Order | null => {
                // Crear un OrderDetail completo con los datos del padre
                const orderDetail: OrderDetail = {
                  id: detalle.id,
                  ordenId: ordenData.ordenId,
                  producto: detalle.producto,
                  cantidad: detalle.cantidad,
                  estado: detalle.estado,
                  comentario: detalle.comentario || null,
                  complementos: detalle.complementosProducto || [],
                  exclusiones: detalle.exclusionesProducto || [],
                  fechaHora: ordenData.fechaHora,
                  fechaHoraInicioEstado: detalle.fechaHoraInicioEstado || null,
                  mesaId: ordenData.mesaId,
                  numeroOrden: ordenData.numeroOrden,
                  tipoOrden: ordenData.tipoOrden,
                };
                return transformOrderDetail(orderDetail, ordenData);
              })
              .filter((order): order is Order => order !== null);
            
            console.log('[WS] Órdenes transformadas de NUEVA_ORDEN:', transformed.length);
            
            // Agregar las nuevas órdenes al estado existente (no reemplazar)
            setOrders((prev) => {
              // Filtrar órdenes que ya existen (por ID) y agregar las nuevas
              const existingIds = new Set(prev.map((o: Order) => o.id));
              const newOrders = transformed.filter((o: Order) => !existingIds.has(o.id));
              const combined = [...prev, ...newOrders];
              console.log('[WS] Órdenes totales después de agregar nuevas:', combined.length);
              return combined;
            });
          } else if (msg.eventType === "ACTUALIZACION_ORDEN") {
            // El backend puede enviar data como array o como objeto directo
            const updates = Array.isArray(msg.data) ? msg.data : [msg.data];
            console.log('[WS] ACTUALIZACION_ORDEN recibida:', updates);
            
            setOrders((prev) => {
              let currentOrders = prev;
              
              // Procesar cada actualización
              for (const update of updates) {
                if (!update || !update.estadoNuevo || !update.detallesIds || update.detallesIds.length === 0) {
                  console.warn('[WS] ACTUALIZACION_ORDEN con datos incompletos:', update);
                  continue;
                }
                
                const mappedStatus = mapApiStatusToAppStatus(update.estadoNuevo);
                console.log('[WS] Estado mapeado:', update.estadoNuevo, '->', mappedStatus);
                console.log('[WS] IDs de detalles a actualizar:', update.detallesIds);
                
                // Si el estado mapeado es null (Entregado o Cancelado), eliminar las órdenes
                if (!mappedStatus) {
                  console.log(`[WS] Estado es Entregado/Cancelado, eliminando órdenes con IDs:`, update.detallesIds);
                  currentOrders = currentOrders.filter((order) => !update.detallesIds?.includes(order.id));
                  console.log('[WS] Órdenes después de filtrar:', currentOrders.length);
                } else {
                  // Si el estado es válido, actualizar las órdenes
                  currentOrders = currentOrders.map((order) => {
                    if (update.detallesIds?.includes(order.id)) {
                      console.log(`[WS] Actualizando orden ${order.id} de "${order.status}" a "${mappedStatus}"`);
                      return { ...order, status: mappedStatus };
                    }
                    return order;
                  });
                }
              }
              
              console.log('[WS] Órdenes después de procesar todas las actualizaciones:', currentOrders.length);
              return currentOrders;
            });
          }
        } catch (err) {
          console.log('[WS] Error parsing WS message', err);
        }
      };
    };

    connect();
    return () => {
      manuallyClosed = true;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token, isAuthenticated]);

  // GET inicial solo una vez
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated]);

  const queueOrders = orders.filter((order) => order.status === "queue");
  const preparingOrders = orders.filter((order) => order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready");

  return {
    orders,
    queueOrders,
    preparingOrders,
    readyOrders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
};

// Utilidad para mapear el estado del backend al de la app
function mapApiStatusToAppStatus(apiStatus: string | undefined | null): OrderStatus | null {
  if (!apiStatus || typeof apiStatus !== 'string') {
    console.warn('[WS] mapApiStatusToAppStatus recibió valor inválido:', apiStatus);
    return null;
  }
  const normalizedStatus = apiStatus.toLowerCase().trim();
  // Remover espacios adicionales y caracteres especiales
  const cleanStatus = normalizedStatus.replace(/\s+/g, ' ').trim();
  
  if (cleanStatus === "solicitado") return "queue";
  if (["en preparación", "en preparacion", "enpreparacion", "en preparacion"].includes(cleanStatus)) return "preparing";
  if (["listo para entregar", "listoparaentregar", "listo para entregar"].includes(cleanStatus)) return "ready";
  // Estados finales que deben eliminar la orden
  if (["entregado", "cancelado", "entregada", "cancelada"].includes(cleanStatus)) return null;
  console.warn('[WS] Estado no reconocido:', apiStatus, '(normalizado:', cleanStatus, ')');
  return null;
}

export default useOrdersSocket;
