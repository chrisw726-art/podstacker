import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { AppShell } from "../src/components/AppShell";
import { PlayerProvider } from "../src/state/player";
import { ThemeProvider } from "../src/theme/ThemeProvider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <AppShell>
          <Stack screenOptions={{ headerShown: false }} />
        </AppShell>
      </PlayerProvider>
    </ThemeProvider>
  );
}
