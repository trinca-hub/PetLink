import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { TutorPalette } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: TutorPalette.primary,
        tabBarInactiveTintColor: TutorPalette.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarStyle: {
          height: Platform.OS === 'android' ? 66 : 82,
          paddingBottom: Platform.OS === 'android' ? 8 : 20,
          backgroundColor: 'rgba(7, 21, 43, 0.96)',
          borderTopColor: 'rgba(255,255,255,0.12)',
          borderTopWidth: 1,
          shadowColor: TutorPalette.shadow,
          shadowOpacity: 0.2,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <Ionicons name="home-outline" size={24} color={color} />;
            case 'petshop':
              return <Ionicons name="storefront-outline" size={22} color={color} />;
            case 'carrinho':
              return <Ionicons name="cart-outline" size={22} color={color} />;
            case 'favoritos':
              return <Ionicons name="heart-outline" size={22} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="petshop" options={{ title: 'Loja' }} />
      <Tabs.Screen name="carrinho" options={{ title: 'Carrinho' }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="petinder" options={{ href: null }} />
      <Tabs.Screen name="petfinder" options={{ href: null }} />
      <Tabs.Screen name="paypet" options={{ href: null }} />
      <Tabs.Screen name="perfil" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
