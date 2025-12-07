/**
 * OrderItem component - Individual item within an order with checkbox
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { OrderItem as OrderItemType } from '@/types/order';

interface OrderItemProps {
  item: OrderItemType;
  onToggle: (itemId: string) => void;
}

export default function OrderItem({ item, onToggle }: OrderItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
      className={`flex-row items-start p-3 mb-2 rounded-lg border-2 ${
        item.completed
          ? 'bg-slate-700/50 border-slate-600'
          : 'bg-kitchen-surface border-slate-600'
      }`}
    >
      {/* Checkbox */}
      <View
        className={`w-7 h-7 rounded border-2 mr-3 justify-center items-center mt-0.5 ${
          item.completed
            ? 'bg-status-ready border-status-ready'
            : 'border-slate-500'
        }`}
      >
        {item.completed && (
          <Text className="text-white font-bold text-lg">✓</Text>
        )}
      </View>

      {/* Item details */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text
            className={`font-bold text-xl mr-2 ${
              item.completed ? 'text-slate-300 line-through' : 'text-white'
            }`}
          >
            {item.quantity}x
          </Text>
          <Text
            className={`font-semibold text-lg flex-1 ${
              item.completed ? 'text-slate-300 line-through' : 'text-slate-100'
            }`}
          >
            {item.name}
          </Text>
        </View>

        {/* Modifiers */}
        {item.modifiers && item.modifiers.length > 0 && (
          <View className="mt-1 ml-8">
            {item.modifiers.map((modifier, index) => (
              <Text
                key={index}
                className={`text-base font-medium ${
                  item.completed ? 'text-slate-400' : 'text-amber-400'
                }`}
              >
                ⚠️ {modifier}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
