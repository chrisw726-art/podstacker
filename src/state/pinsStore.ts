import { KEYS, readJson, writeJson } from "../lib/storage";
import { Pin } from "../types/podcast";

/* -----------------------------
   Internal helpers
-------------------------------- */

async function getPinsMap(): Promise<Record<string, Pin[]>> {
  return readJson<Record<string, Pin[]>>(KEYS.PINS, {});
}

async function setPinsMap(map: Record<string, Pin[]>) {
  await writeJson(KEYS.PINS, map);
}

/* -----------------------------
   Public API
-------------------------------- */

export async function addPin(podcastId: string, pin: Pin) {
  const pins = await getPinsMap();
  const list = pins[podcastId] ?? [];
  pins[podcastId] = [pin, ...list].slice(0, 200);
  await setPinsMap(pins);
}

export async function removePin(podcastId: string, pinId: string) {
  const pins = await getPinsMap();
  pins[podcastId] = (pins[podcastId] ?? []).filter((p) => p.id !== pinId);
  await setPinsMap(pins);
}

export async function getPinsForPodcast(podcastId: string): Promise<Pin[]> {
  const pins = await getPinsMap();
  return pins[podcastId] ?? [];
}

export async function getPinsForEpisode(
  podcastId: string,
  episodeId: string
): Promise<Pin[]> {
  const pins = await getPinsMap();
  return (pins[podcastId] ?? []).filter((p) => p.episodeId === episodeId);
}
