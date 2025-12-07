import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Definimos los tipos de datos para TypeScript (Buenas prácticas)
interface OrderItem {
  id: string;
  qty: number;
  name: string;
  modifiers?: string[]; // Ej: ["Sin cebolla", "Extra queso"]
  completed: boolean;
}

interface OrderTicketProps {
  table: string;
  timeElapsed: string; // Ej: "12 min"
  status: 'new' | 'warning' | 'late'; // Para el color del semáforo
  items: OrderItem[];
}

export default function OrderTicket({ table, timeElapsed, status, items }: OrderTicketProps) {
  // Estado local para marcar items individuales como completados (Tu Opción B)
  const [localItems, setLocalItems] = useState(items);

  const toggleItem = (id: string) => {
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Lógica del Semáforo de Color
  const getHeaderColor = () => {
    switch (status) {
      case 'new': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'late': return 'bg-red-600 animate-pulse'; // animate-pulse funciona en NativeWind
      default: return 'bg-gray-500';
    }
  };

  return (
    <View className="bg-white rounded-xl shadow-md border-2 border-gray-200 m-2 overflow-hidden flex-1 min-w-[300px] max-w-[400px]">
      
      {/* --- HEADER: MESA Y TIEMPO --- */}
      <View className={`${getHeaderColor()} p-4 flex-row justify-between items-center`}>
        <Text className="text-white font-bold text-3xl">Mesa {table}</Text>
        <View className="bg-black/20 px-3 py-1 rounded-lg">
           <Text className="text-white font-bold text-xl">⏱ {timeElapsed}</Text>
        </View>
      </View>

      {/* --- BODY: LISTA DE PLATILLOS --- */}
      <View className="p-2 bg-gray-50">
        {localItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
            className={`flex-row items-start p-3 mb-2 rounded-lg border-2 ${
              item.completed ? 'bg-gray-200 border-gray-300' : 'bg-white border-gray-300'
            }`}
          >
            {/* Checkbox Gigante Visual */}
            <View className={`w-8 h-8 rounded border-2 mr-4 justify-center items-center ${
              item.completed ? 'bg-gray-500 border-gray-500' : 'border-gray-400'
            }`}>
              {item.completed && <Text className="text-white font-bold text-xl">✓</Text>}
            </View>

            {/* Detalles del Platillo */}
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className={`font-bold text-2xl mr-2 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {item.qty}x
                </Text>
                <Text className={`font-bold text-xl flex-1 flex-wrap ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.name}
                </Text>
              </View>

              {/* Modificadores (CRÍTICO: ROJO Y GRANDE) */}
              {item.modifiers && item.modifiers.map((mod, index) => (
                <Text key={index} className="text-red-600 font-bold text-lg mt-1 ml-8">
                  ⚠️ {mod}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- FOOTER: ACCIÓN --- */}
      <TouchableOpacity className="bg-blue-600 p-5 items-center justify-center active:bg-blue-800">
        <Text className="text-white font-bold text-2xl uppercase tracking-widest">
          Terminar Orden
        </Text>
      </TouchableOpacity>

    </View>
  );
}
