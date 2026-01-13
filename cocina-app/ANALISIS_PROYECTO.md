# Análisis Completo del Proyecto Cocina-App

## 📋 Resumen Ejecutivo

**Cocina-App** es una aplicación móvil desarrollada con React Native y Expo para gestionar órdenes de cocina y barra en restaurantes. La aplicación utiliza WebSockets para actualizaciones en tiempo real y está diseñada para funcionar en modo landscape (horizontal).

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

- **Framework**: React Native con Expo (~54.0.25)
- **Lenguaje**: TypeScript (5.9.2)
- **Navegación**: Expo Router (file-based routing) + React Navigation
- **Estilos**: NativeWind (Tailwind CSS para React Native)
- **Estado Global**: React Context API
- **Almacenamiento**: AsyncStorage
- **Comunicación**: 
  - REST API (HTTP)
  - WebSockets (para actualizaciones en tiempo real)

### Estructura de Directorios

```
cocina-app/
├── api/                    # Capa de API
│   ├── authApi.ts         # Autenticación (login, refresh, recuperación contraseña)
│   └── ordersApi.ts       # Gestión de órdenes (GET, PATCH, POST)
├── app/                   # Rutas de Expo Router (file-based routing)
│   ├── _layout.tsx        # Layout raíz con protección de rutas
│   ├── login.tsx          # Pantalla de login
│   ├── forgot-password.tsx # Recuperación de contraseña
│   ├── reset-password.tsx # Restablecimiento de contraseña
│   └── (tabs)/            # Grupo de tabs
│       ├── _layout.tsx    # Layout de tabs (oculto)
│       ├── index.tsx      # Cocina (pantalla principal)
│       ├── bar.tsx        # Barra
│       └── explore.tsx    # Oculto
├── components/            # Componentes reutilizables
│   ├── kitchen/          # Componentes específicos de cocina
│   │   ├── KitchenHeader.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderColumn.tsx
│   │   ├── OrderItem.tsx
│   │   └── TimeAgo.tsx
│   └── ui/               # Componentes UI genéricos
├── constants/            # Constantes de la aplicación
│   ├── api.ts           # URLs y configuración de API
│   ├── kitchen.ts       # Constantes de cocina (MAX_PREPARING_ORDERS)
│   └── theme.ts         # Colores y temas
├── context/             # Contextos de React
│   └── AuthContext.tsx  # Contexto de autenticación
├── hooks/               # Hooks personalizados
│   ├── useOrders.ts     # Hook para órdenes (polling)
│   ├── useOrdersSocket.ts # Hook para órdenes (WebSocket)
│   ├── useToast.ts      # Hook para notificaciones toast
│   └── ...
├── screens/             # Pantallas (legacy - no se usan con Expo Router)
│   ├── CocinaScreen.tsx
│   ├── BarraScreen.tsx
│   └── LoginScreen.tsx
├── types/               # Definiciones de tipos TypeScript
│   ├── auth.ts
│   └── order.ts
└── data/                # Datos mock (mockOrders.ts)
```

---

## 🔑 Características Principales

### 1. Autenticación
- Login con correo y contraseña
- Tokens JWT (accessToken + refreshToken)
- Recuperación de contraseña por email
- Restablecimiento de contraseña con token
- Protección de rutas basada en autenticación
- Persistencia de sesión con AsyncStorage

### 2. Gestión de Órdenes

#### Estados de Orden
- **Queue (Solicitado)**: Órdenes en espera
- **Preparing (En Preparación)**: Órdenes siendo preparadas
- **Ready (Listo para Entregar)**: Órdenes listas

#### Funcionalidades
- Visualización de órdenes en columnas tipo Kanban
- Actualización de estado de órdenes
- Cancelación de órdenes
- Límite máximo de órdenes en preparación (MAX_PREPARING_ORDERS = 10)
- Visualización de complementos, exclusiones y comentarios
- Tiempo transcurrido desde la orden
- Sistema de prioridades basado en tiempo

### 3. Comunicación en Tiempo Real

#### Dos Implementaciones:
1. **useOrders.ts**: Polling cada 5 segundos
2. **useOrdersSocket.ts**: WebSockets para actualizaciones instantáneas

**Nota**: Actualmente se está usando `useOrdersSocket` en las pantallas principales.

### 4. Pantallas

#### Cocina (`app/(tabs)/index.tsx`)
- Visualización de órdenes de comida
- Tres columnas: En Cola, En Preparación, Listos
- Acciones: Comenzar preparación, Marcar como listo, Cancelar

#### Barra (`app/(tabs)/bar.tsx`)
- Visualización de órdenes de bebidas
- Similar a Cocina pero adaptado para barra
- Colores diferentes para diferenciación

---

## ⚠️ Problemas y Issues Detectados

### 🔴 Críticos

1. **ThemeContext No Existe**
   - **Ubicación**: `screens/CocinaScreen.tsx`, `screens/BarraScreen.tsx`, `screens/LoginScreen.tsx`, `navigation/AppNavigator.tsx`
   - **Problema**: Se importa `useTheme` de `context/ThemeContext` pero el archivo no existe
   - **Impacto**: Estas pantallas no funcionarán si se intentan usar
   - **Nota**: Las pantallas en `/app/(tabs)/` no usan ThemeContext, usan NativeWind

2. **Variable `refreshing` No Definida**
   - **Ubicación**: `screens/CocinaScreen.tsx:94`, `screens/BarraScreen.tsx:64`
   - **Problema**: Se usa `!refreshing` pero la variable nunca se define
   - **Impacto**: Error en tiempo de ejecución

3. **Código Fuera de Lugar en `app/login.tsx`**
   - **Líneas 1-18**: Código de botón de prueba antes del import
   - **Problema**: Estructura incorrecta del archivo
   - **Impacto**: Potencial error de sintaxis/compilación

4. **Prop `onMarkAsDelivered` No Definida**
   - **Ubicación**: `app/(tabs)/bar.tsx:75` pasa `onMarkAsDelivered` a `OrderColumn`
   - **Problema**: `OrderColumn` no acepta esta prop
   - **Impacto**: Error TypeScript/runtime

### 🟡 Advertencias

5. **Duplicación de Pantallas**
   - Existen pantallas en `/screens/` y `/app/(tabs)/`
   - Las de `/screens/` parecen legacy y no se usan con Expo Router
   - Recomendación: Eliminar o migrar completamente

6. **Dos Sistemas de Gestión de Órdenes**
   - `useOrders.ts` (polling)
   - `useOrdersSocket.ts` (WebSockets)
   - Solo se usa uno actualmente, el otro es código muerto

7. **Navegación Duplicada**
   - `navigation/AppNavigator.tsx` usa React Navigation tradicional
   - Expo Router ya maneja la navegación
   - Conflicto potencial

8. **URLs Hardcodeadas**
   - `API_BASE_URL = "http://137.184.191.81"` (sin HTTPS)
   - `WS_BASE_URL = "ws://137.184.191.81/ws/orders"` (sin WSS)
   - Problema de seguridad y configuración

9. **Error Tipográfico en `authApi.ts:37`**
   - Espacio extra: `errorData. message` debería ser `errorData.message`

10. **Espacios Extra en Varios Archivos**
    - `recentlyModifiedIds.current. add` → `recentlyModifiedIds.current.add`
    - `modificationTimers.current. set` → `modificationTimers.current.set`
    - `order. id` → `order.id`
    - `order. comentario` → `order.comentario`
    - `order. complementos` → `order.complementos`

### 🟢 Mejoras Recomendadas

11. **Validación de Formularios**
    - Falta validación robusta en login y reset password
    - No hay validación de formato de email

12. **Manejo de Errores**
    - Algunos errores solo se muestran en consola
    - Falta feedback visual consistente

13. **Testing**
    - No se encuentran archivos de pruebas
    - Recomendación: Agregar tests unitarios e integración

14. **Documentación**
    - README.md es genérico de Expo
    - Falta documentación de API y flujos

15. **Configuración de Ambiente**
    - URLs hardcodeadas
    - Falta sistema de variables de entorno

---

## 🔄 Flujos Principales

### Flujo de Autenticación

```
1. Usuario ingresa correo/contraseña → login.tsx
2. signIn() → AuthContext.signIn()
3. authApi.login() → Backend
4. Guarda tokens en AsyncStorage
5. Router redirige a /(tabs)
6. _layout.tsx verifica isAuthenticated
```

### Flujo de Gestión de Órdenes

```
1. Pantalla carga → useOrdersSocket()
2. GET inicial → ordersApi.getOrderDetails()
3. Conexión WebSocket → ws://137.184.191.81/ws/orders
4. Eventos recibidos:
   - NUEVA_ORDEN → Agregar órdenes
   - ACTUALIZACION_ORDEN → Actualizar estado
5. Usuario cambia estado → PATCH ordersApi.updateOrderDetailStatus()
6. WebSocket recibe confirmación → Actualiza UI
```

---

## 📊 Estadísticas del Proyecto

- **Lenguaje Principal**: TypeScript
- **Framework**: React Native + Expo
- **Estilos**: NativeWind (Tailwind CSS)
- **Navegación**: Expo Router (file-based)
- **Gestión de Estado**: Context API
- **Backend**: REST API + WebSockets
- **Almacenamiento**: AsyncStorage

### Archivos Clave

- **API**: 2 archivos
- **Componentes**: ~15 componentes
- **Hooks**: 5 hooks personalizados
- **Contextos**: 1 (AuthContext)
- **Pantallas Activas**: 2 (Cocina, Barra)
- **Pantallas Legacy**: 3 (en /screens/)

---

## ✅ Recomendaciones de Acción

### Prioridad Alta (Crítico)

1. ✅ Crear `context/ThemeContext.tsx` o eliminar referencias
2. ✅ Eliminar variable `refreshing` no definida
3. ✅ Arreglar estructura de `app/login.tsx`
4. ✅ Eliminar prop `onMarkAsDelivered` o agregarla a `OrderColumn`

### Prioridad Media

5. ✅ Limpiar código duplicado (screens legacy)
6. ✅ Decidir entre polling o WebSockets (eliminar uno)
7. ✅ Resolver conflicto de navegación (Expo Router vs React Navigation)
8. ✅ Mover URLs a variables de entorno
9. ✅ Corregir errores tipográficos (espacios extra)

### Prioridad Baja

10. ✅ Agregar validación de formularios
11. ✅ Mejorar manejo de errores
12. ✅ Agregar tests
13. ✅ Mejorar documentación
14. ✅ Configurar variables de entorno

---

## 🎯 Conclusión

El proyecto tiene una base sólida con una arquitectura moderna (Expo Router, TypeScript, WebSockets), pero presenta varios problemas que deben resolverse antes de producción:

- **Código crítico roto**: ThemeContext y variables no definidas
- **Código duplicado**: Dos sistemas de navegación y gestión de órdenes
- **Configuración**: URLs hardcodeadas sin variables de entorno
- **Calidad**: Errores tipográficos y código legacy

Con las correcciones recomendadas, el proyecto estará listo para producción.

---

**Fecha de Análisis**: $(date)
**Versión Analizada**: 1.0.0
**Última Revisión**: Archivos actuales del repositorio

