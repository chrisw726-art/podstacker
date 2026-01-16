import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = {
  LIBRARY: "podstacker.library.v1",
  EPISODES: "podstacker.episodes.v1",
  DOWNLOADS: "podstacker.downloads.v1",
  PINS: "podstacker.pins.v1",
  SETTINGS: "podstacker.settings.v1",
  PLAYBACK: "podstacker.playback.v1"
};

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
