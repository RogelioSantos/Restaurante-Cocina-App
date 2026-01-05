import { API_BASE_URL } from "../constants/api";

export interface OrderDetail {
  id: number;
  producto: string;
  estado:
    | "Solicitado"
    | "EnPreparacion"
    | "ListoParaEntregar"
    | "Entregado"
    | "Cancelado";
  fechaHora: string;
  empleado: string;
  fechaHoraInicioEstado: string;
  mesaId: number;
  tipoCategoria?: "Alimentos" | "Bebidas";
}

export const ordersApi = {
  getOrderDetails: async (
    token: string,
    page?: number,
    pageSize?: number
  ): Promise<OrderDetail[]> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (pageSize) params.append("pageSize", pageSize.toString());

    const url = params.toString()
      ? `${API_BASE_URL}/orders/details?${params}`
      : `${API_BASE_URL}/orders/details`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener órdenes");
    return await response.json();
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

    if (!response.ok) throw new Error("Error al actualizar estado");
  },
};
