import { Stack } from "expo-router";
import MiniPlayer from "../../src/components/MiniPlayer";

export default function TabLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <MiniPlayer />
    </>
  );
}
