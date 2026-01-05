import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LoginScreen from "../screens/LoginScreen";
import CocinaScreen from "../screens/CocinaScreen";
import BarraScreen from "../screens/BarraScreen";

const Tab = createBottomTabNavigator();

const LoadingScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const MainTabs: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Determinar qué tabs mostrar basado en el tipo de usuario
  const showCocina = !user?.tipo || user.tipo === "Cocina" || user.tipo === "Gerente";
  const showBarra = !user?.tipo || user.tipo === "Barra" || user.tipo === "Gerente";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Cocina") {
            iconName = focused ? "restaurant" : "restaurant-outline";
          } else if (route.name === "Barra") {
            iconName = focused ? "beer" : "beer-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      {showCocina && (
        <Tab.Screen
          name="Cocina"
          component={CocinaScreen}
          options={{
            title: "Cocina",
            tabBarLabel: "Cocina",
          }}
        />
      )}
      {showBarra && (
        <Tab.Screen
          name="Barra"
          component={BarraScreen}
          options={{
            title: "Barra",
            tabBarLabel: "Barra",
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
