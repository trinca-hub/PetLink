import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

const blue = '#007AFF';
const gray = '#999';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: blue,
        tabBarInactiveTintColor: gray,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarStyle: {
          height: Platform.OS === 'android' ? 65 : 80,
          paddingBottom: Platform.OS === 'android' ? 8 : 20,
          backgroundColor: '#fff',
          borderTopColor: '#ccc',
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'index':
              return <Ionicons name="home-outline" size={24} color={color} />;
            case 'petinder':
              return <FontAwesome name="heart-o" size={22} color={color} />;
            case 'petfinder':
              return <Feather name="search" size={22} color={color} />; // antes: compass
            case 'paypet':
              return <Feather name="tag" size={22} color={color} />;
            case 'petshop':
              return <MaterialIcons name="shopping-cart" size={22} color={color} />;
            case 'perfil':
              return <Ionicons name="person-outline" size={24} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="petinder" options={{ title: 'PeTinder' }} />
      <Tabs.Screen name="petfinder" options={{ title: 'PetFinder' }} />
      <Tabs.Screen name="paypet" options={{ title: 'PayPet' }} />
      <Tabs.Screen name="petshop" options={{ title: 'PetShop' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
