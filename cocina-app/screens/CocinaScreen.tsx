import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Order } from "../hooks/useOrders";
// Usa el hook de WebSocket para actualizaciones en tiempo real
import { ordersApi } from "../api/ordersApi";
import useOrdersSocket from "../hooks/useOrdersSocket";

const CocinaScreen: React.FC = () => {
  const { colors } = useTheme();
  const { signOut, user } = useAuth();

  const { 
    queueOrders,
    preparingOrders,
    readyOrders,
    isLoading,
    error,
    refetch,
  } = useOrdersSocket();
  const { token } = useAuth();
  const [loadingOrderId, setLoadingOrderId] = React.useState<number | null>(null);

  // Reactivar acciones: PATCH al backend y esperar evento por WebSocket
  const handleStatusChange = async (order: Order, newStatus: "preparing" | "ready") => {
    if (!token) return;
    setLoadingOrderId(order.id);
    try {
      await ordersApi.updateOrderDetailStatus(token, order.ordenId, [order.id], newStatus === "preparing" ? "EnPreparacion" : "ListoParaEntregar");
    } catch (err) {
      // Puedes mostrar un toast de error aquí si quieres
      console.error(err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <Text style={[styles.orderProduct, { color: colors.text }]}>{item.producto}</Text>
        <Text style={[styles.orderMesa, { color: colors.textSecondary }]}>Mesa {item.mesaId}</Text>
      </View>
      <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
        {new Date(item.fechaHora).toLocaleTimeString()}
      </Text>
      <View style={styles.buttonContainer}>
        {item.status === "queue" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning || "#F59E0B" }, loadingOrderId === item.id && { opacity: 0.5 }]}
            onPress={() => handleStatusChange(item, "preparing")}
            disabled={loadingOrderId === item.id}
          >
            <Text style={styles.buttonText}>{loadingOrderId === item.id ? "Enviando..." : "Iniciar Preparación"}</Text>
          </TouchableOpacity>
        )}
        {item.status === "preparing" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success || "#10B981" }, loadingOrderId === item.id && { opacity: 0.5 }]}
            onPress={() => handleStatusChange(item, "ready")}
            disabled={loadingOrderId === item.id}
          >
            <Text style={styles.buttonText}>{loadingOrderId === item.id ? "Enviando..." : "Marcar como Listo"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderColumn = (title: string, orders: Order[], color: string) => (
    <View style={[styles.column, { borderColor: colors.border }]}>
      <View style={[styles.columnHeader, { backgroundColor: color }]}>
        <Text style={styles.columnTitle}>{title}</Text>
        <Text style={styles.columnCount}>{orders.length}</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error || "#EF4444" }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={refetch}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Bienvenido,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.nombre} {user?.apellidoPaterno}
          </Text>
        </View>
        <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.border }]} onPress={signOut}>
          <Text style={[styles.logoutText, { color: colors.error || "#EF4444" }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View
        style={styles.columnsContainer}
      >
        {renderColumn("En Cola", queueOrders, "#3B82F6")}
        {renderColumn("En Preparación", preparingOrders, "#F59E0B")}
        {renderColumn("Listos", readyOrders, "#10B981")}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  welcomeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
  },
  columnsContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 8,
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  columnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  columnCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  listContent: {
    padding: 8,
  },
  orderCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  orderMesa: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderTime: {
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});

export default CocinaScreen;
