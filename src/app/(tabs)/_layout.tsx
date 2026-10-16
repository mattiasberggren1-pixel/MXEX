import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { C } from '../../components/ui';

type Icon = React.ComponentProps<typeof Ionicons>['name'];
function icon(name: Icon) {
  const TabIcon = ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color as string} size={size} />;
  return TabIcon;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.dim,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line },
        headerStyle: { backgroundColor: C.card },
        headerTintColor: C.text,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Garage', headerTitle: 'MXEX', tabBarIcon: icon('bicycle') }} />
      <Tabs.Screen name="suspension" options={{ title: 'Fjädring', tabBarIcon: icon('options') }} />
      <Tabs.Screen name="engine" options={{ title: 'Motor', tabBarIcon: icon('flash') }} />
      <Tabs.Screen name="log" options={{ title: 'Logg', tabBarIcon: icon('stopwatch') }} />
    </Tabs>
  );
}
