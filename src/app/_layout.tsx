import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { C } from '../components/ui';
import { StoreProvider } from '../store';

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card, primary: C.accent, text: C.text, border: C.line } };

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: C.text }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="bike/[id]" options={{ title: 'Cykel', presentation: 'modal' }} />
          <Stack.Screen name="map/[id]" options={{ title: 'Mapp' }} />
          <Stack.Screen name="import" options={{ title: 'Importera mapp', presentation: 'modal' }} />
          <Stack.Screen name="map/index" options={{ title: 'Importera mapp' }} />
          <Stack.Screen name="troubleshoot" options={{ title: 'Felsök fjädringen' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
