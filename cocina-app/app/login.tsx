import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
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

import { Image as RNImage } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email. trim() || !password.trim()) {
      setError("Por favor ingresa correo y contraseña");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Obtener la parte del email antes del "@"
      const emailPart = email.trim().split('@')[0];
      
      // Verificar si la contraseña es igual a la parte del email antes del "@"
      if (password.trim() === emailPart) {
        // Si la contraseña es predeterminada, redirigir a la pantalla de cambio obligatorio
        router.push({
          pathname: '/must-change-password',
          params: { email: email.trim() }
        });
        setIsLoading(false);
        return;
      }

      await signIn(email. trim(), password);
      
      // Después de login exitoso, el _layout.tsx manejará la redirección según el tipo de usuario
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
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
            {/* Logo y título */}
            <View className="items-center mb-8">
              <Image 
                source={require('@/assets/images/logo.png')}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
              <Text className="text-white text-4xl font-bold mt-4">Mesa Libre</Text>
              <Text className="text-slate-400 text-lg mt-2">
                Sistema de Cocina
              </Text>
            </View>

            {/* Formulario */}
            <View className="w-full max-w-sm">
              {/* Email */}
              <View className="mb-4">
                <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">
                  Correo electrónico
                </Text>
                <TextInput
                  className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={! isLoading}
                />
              </View>

              {/* Password con ícono de mostrar/ocultar (solo el campo con icono a la derecha) */}
              <View className="mb-6">
                <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">
                  Contraseña
                </Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-lg"
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="off"
                    editable={!isLoading}
                    style={{ paddingRight: 40 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={{ position: 'absolute', right: 12, top: 0, height: '100%', justifyContent: 'center' }}
                  >
                    <RNImage
                      source={showPassword
                        ? require("@/assets/images/view.png")
                        : require("@/assets/images/hide.png")}
                      style={{ width: 24, height: 24, tintColor: '#64748b' }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {error ? (
                <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-center font-medium">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Botón de login */}
              <TouchableOpacity
                className={`py-4 rounded-xl ${
                  isLoading ? "bg-amber-700" : "bg-amber-600"
                } active:bg-amber-700`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-xl font-bold">
                    Iniciar Sesión
                  </Text>
                )}
              </TouchableOpacity>
          

              {/* Enlace funcional de recuperación de contraseña */}
              <TouchableOpacity
                onPress={() => {
                  router.push('/forgot-password');
                }}
                style={{ marginTop: 24 }}
              >
                <Text style={{ color: '#eab308', textAlign: 'center', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 16 }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* ...existing code... */}
            {/* Footer */}
            <Text className="text-slate-500 text-sm mt-10">
              Mesa Libre © 2026
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}