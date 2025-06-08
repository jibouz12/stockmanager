import { Tabs } from 'expo-router';
import { Package, TrendingDown, CircleAlert as AlertCircle, Calendar } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 12,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tout le stock',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="low-stock"
        options={{
          title: 'Stock bas',
          tabBarIcon: ({ size, color }) => (
            <TrendingDown size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="out-of-stock"
        options={{
          title: 'Rupture',
          tabBarIcon: ({ size, color }) => (
            <AlertCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expiring"
        options={{
          title: 'DLC < 5j',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}