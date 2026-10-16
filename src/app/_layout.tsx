import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Header } from '../components/Header';
import { C } from '../components/ui';
import { StoreProvider } from '../store';

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.card, primary: C.accent, text: C.text, border: C.line } };

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ header: ({ options, navigation, back }) => <Header title={options.title} onBack={back ? navigation.goBack : undefined} /> }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="bike/[id]" options={{ title: 'Cykel' }} />
          <Stack.Screen name="map/[id]" options={{ title: 'Mapp' }} />
          <Stack.Screen name="import" options={{ title: 'Importera mapp' }} />
          <Stack.Screen name="map/index" options={{ title: 'Importera mapp' }} />
          <Stack.Screen name="service/[id]" options={{ title: 'Service' }} />
          <Stack.Screen name="troubleshoot" options={{ title: 'Felsök fjädringen' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
