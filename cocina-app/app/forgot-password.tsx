import { authApi } from "@/api/authApi";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, TextInput, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  console.log("ForgotPasswordScreen montado");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    console.log("[FORGOT PASSWORD] Botón presionado, email:", email);
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      console.log("[FORGOT PASSWORD] Email vacío");
      return;
    }
    setIsLoading(true);
    try {
      console.log("[FORGOT PASSWORD] Enviando solicitud al backend...");
      await authApi.forgotPassword(email.trim(), "http://137.184.191.81/reset-password.html");
      setMessage("Si el correo está registrado, recibirás un email con instrucciones para recuperar tu contraseña.");
      console.log("[FORGOT PASSWORD] Solicitud exitosa, muestra mensaje");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al solicitar recuperación";
      // Si es un error de CORS, mostrar un mensaje más amigable
      if (errorMessage.includes("CORS") || errorMessage.includes("conexión con el servidor")) {
        setError("Error de conexión. El servidor no está permitiendo la solicitud. Por favor, contacta al administrador del sistema.");
      } else {
        setError(errorMessage);
      }
      console.log("[FORGOT PASSWORD] Error:", err);
    } finally {
      setIsLoading(false);
      console.log("[FORGOT PASSWORD] setIsLoading(false)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded, marginBottom: 16 }}>
            Recuperar Contraseña
          </ThemedText>
          <ThemedText style={{ marginBottom: 8 }}>
            Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
          </ThemedText>
          <View className="w-full max-w-sm mb-4">
            <TextInput
              className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>
          {error ? (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
              <ThemedText style={{ color: '#ef4444', textAlign: 'center', fontWeight: '500' }}>{error}</ThemedText>
            </View>
          ) : null}
          {message ? (
            <View className="bg-green-500/20 border border-green-500 rounded-xl p-3 mb-4">
              <ThemedText style={{ color: '#22c55e', textAlign: 'center', fontWeight: '500' }}>{message}</ThemedText>
            </View>
          ) : null}
          <TouchableOpacity
            className={`py-4 rounded-xl w-full max-w-sm ${isLoading ? "bg-amber-700" : "bg-amber-600"} active:bg-amber-700 mb-2`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                Enviar instrucciones
              </ThemedText>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/login')} className="mt-2">
            <ThemedText type="link">Volver al login</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
