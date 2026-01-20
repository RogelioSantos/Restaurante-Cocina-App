import { authApi } from "@/api/authApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MustChangePasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [emailValue, setEmailValue] = useState(Array.isArray(email) ? email[0] || "" : email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!emailValue.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword(emailValue.trim(), "http://137.184.191.81/reset-password.html");
      setMessage("Se te ha enviado un email con instrucciones para cambiar tu contraseña. Por favor revisa tu bandeja de entrada.");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al solicitar cambio de contraseña";
      // Si es un error de CORS, mostrar un mensaje más amigable
      if (errorMessage.includes("CORS") || errorMessage.includes("conexión con el servidor")) {
        setError("Error de conexión. El servidor no está permitiendo la solicitud. Por favor, contacta al administrador del sistema.");
      } else {
        setError(errorMessage);
      }
      console.error("Error en forgotPassword:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-8">
            {/* Título */}
            <View className="items-center mb-8">
              <Text className="text-white text-4xl font-bold mb-4">Actualizar Contraseña</Text>
              <Text className="text-slate-400 text-lg text-center">
                Debes actualizar tu contraseña para continuar. Te enviaremos un email con instrucciones.
              </Text>
            </View>

            {/* Formulario */}
            <View className="w-full max-w-sm">
              <View className="mb-4">
                <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">
                  Correo electrónico
                </Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#64748b"
                  value={emailValue}
                  onChangeText={setEmailValue}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {error ? (
                <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-center font-medium">{error}</Text>
                </View>
              ) : null}

              {message ? (
                <View className="bg-green-500/20 border border-green-500 rounded-xl p-3 mb-4">
                  <Text className="text-green-400 text-center font-medium">{message}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                className={`py-4 rounded-xl w-full ${isLoading ? "bg-amber-700" : "bg-amber-600"} active:bg-amber-700 mb-4`}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-xl font-bold">
                    Enviar instrucciones
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace('/login')} className="mt-2">
                <Text className="text-amber-500 text-center underline text-base font-semibold">
                  Volver al login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
