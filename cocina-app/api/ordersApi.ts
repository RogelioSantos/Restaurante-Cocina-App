import { API_BASE_URL } from "../constants/api";

// Estructura que viene de la API
interface DetalleOrdenAPI {
  id: number;
  producto: string;
  cantidad: number;
  estado: string;
  comentario: string | null;
  complementosProducto: string[];
  exclusionesProducto: string[];
  fechaHoraInicioEstado: string | null;
}

interface OrdenAPI {
  ordenId: number;
  numeroOrden: number;
  tipoOrden: string;
  detallesOrden: DetalleOrdenAPI[];
  fechaHora: string;
  estado: string;
  mesaId: number;
}

// Estructura que usamos en la app
export interface OrderDetail {
  id:  number;
  ordenId: number;
  producto: string;
  cantidad: number;
  estado: string;
  comentario:  string | null;
  complementos: string[];
  exclusiones:  string[];
  fechaHora: string;
  fechaHoraInicioEstado:  string | null;
  mesaId: number;
  numeroOrden?: number;
  tipoOrden?: string;
}

export const ordersApi = {
  getOrderDetails: async (token:  string): Promise<OrderDetail[]> => {
    const response = await fetch(`${API_BASE_URL}/orders/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener órdenes: ${response. status}`);
    }

    const data: OrdenAPI[] = await response.json();

    const allDetails: OrderDetail[] = [];

    for (const orden of data) {
      for (const detalle of orden.detallesOrden) {
        allDetails.push({
          id: detalle.id,
          ordenId: orden.ordenId,
          producto: detalle.producto,
          cantidad: detalle.cantidad,
          estado: detalle.estado,
          comentario: detalle.comentario,
          complementos: detalle.complementosProducto || [],
          exclusiones: detalle.exclusionesProducto || [],
          fechaHora: orden.fechaHora,
          fechaHoraInicioEstado: detalle.fechaHoraInicioEstado,
          mesaId: orden.mesaId,
          // Si necesitas los nuevos campos, puedes agregarlos aquí
          numeroOrden: orden.numeroOrden,
          tipoOrden: orden.tipoOrden,
        });
      }
    }

    return allDetails;
  },

  updateOrderDetailStatus: async (
    token: string,
    orderId: number,
    detallesOrdenIds: number[],
    estadoDetalleOrden: string
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ detallesOrdenIds, estadoDetalleOrden }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("Error al actualizar estado");
    }
  },

  cancelOrderDetail: async (
    token: string,
    orderDetailId: number,
    tipoCancelacion: "Cancelacion" | "Reposicion" | "ReposicionNuevo" = "Cancelacion"
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/details/${orderDetailId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipoCancelacion,
        productoId: null,
        cantidad: null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error("Error al cancelar orden");
    }
  },
};