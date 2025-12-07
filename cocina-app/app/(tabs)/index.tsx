import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StatusBar } from 'react-native';
import OrderTicket from '@/components/OrderTicket';

export default function App() {
  // Datos falsos para probar (Mock Data)
  const mockOrder = [
    { id: '1', qty: 2, name: 'Hamburguesa Arrachera', modifiers: ['Sin cebolla', 'Término medio'], completed: false },
    { id: '2', qty: 1, name: 'Papas Gajo', completed: false },
    { id: '3', qty: 3, name: 'Refresco Cola', completed: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-800">
      <StatusBar barStyle="light-content" />
      
      {/* Título de la Cocina */}
      <View className="p-4 bg-gray-900">
        <Text className="text-white text-3xl font-bold text-center">👨‍🍳 KDS - Cocina</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <Text className="text-white text-xl mb-4 font-bold">En Preparación (Ejemplo)</Text>
        
        {/* Simulamos un Grid responsivo simple */}
        <View className="flex-row flex-wrap justify-center items-start">
            
            {/* Ticket 1: Normal */}
            <OrderTicket 
              table="04" 
              timeElapsed="05:20" 
              status="new" 
              items={mockOrder} 
            />

            {/* Ticket 2: Atrasado (Rojo) */}
            <OrderTicket 
              table="12" 
              timeElapsed="24:00" 
              status="late" 
              items={[
                { id: 'a', qty: 5, name: 'Tacos Pastor', modifiers: ['Con todo', 'Salsa aparte'], completed: false }
              ]} 
            />

             {/* Ticket 3: Alerta (Amarillo) */}
             <OrderTicket 
              table="08" 
              timeElapsed="12:45" 
              status="warning" 
              items={[
                { id: 'b', qty: 1, name: 'Ensalada César', completed: false }
              ]} 
            />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}