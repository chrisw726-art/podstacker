import { useCallback, useEffect, useState } from "react";
import { KEYS, readJson, writeJson } from "../lib/storage";
import { fetchEpisodesFromFeed } from "../lib/rss";
import { Episode, Pin, Podcast } from "../types/podcast";
import { enqueueDownload } from "./downloads";

/* -----------------------------
   Helpers
-------------------------------- */

function pickArtwork(p: any): string | undefined {
  return (
    p.artwork ||
    p.image ||
    p.imageUrl ||
    p.artworkUrl ||
    p?.itunes?.image ||
    p?.itunesImage ||
    p?.image?.url ||
    undefined
  );
}

/* ✅ exported (used by detail screen) */
export async function getLibrary(): Promise<Record<string, Podcast>> {
  return readJson<Record<string, Podcast>>(KEYS.LIBRARY, {});
}

async function setLibrary(map: Record<string, Podcast>) {
  await writeJson(KEYS.LIBRARY, map);
}

async function getEpisodeMap(): Promise<Record<string, Episode[]>> {
  return readJson<Record<string, Episode[]>>(KEYS.EPISODES, {});
 
}

async function getPinsMap(): Promise<Record<string, Pin[]>> {
  return readJson<Record<string, Pin[]>>(KEYS.PINS, {});
}

/* ✅ MUST be exported (used by podcast detail screen) */
export async function getEpisodesForPodcast(podcastId: string): Promise<Episode[]> {
  const map = await getEpisodeMap();
  return map[podcastId] ?? [];
}

async function setPinsMap(map: Record<string, Pin[]>) {
  await writeJson(KEYS.PINS, map);
}

function mergeEpisodes(local: Episode[], remote: Episode[]) {
  const byId = new Map<string, Episode>();
  for (const e of local) byId.set(e.id, e);

  let newCount = 0;
  for (const e of remote) {
    if (!byId.has(e.id)) newCount++;
    byId.set(e.id, e);
  }

  const all = Array.from(byId.values())
    .sort((a, b) => {
      const ad = Date.parse(a.pubDate ?? "") || 0;
      const bd = Date.parse(b.pubDate ?? "") || 0;
      return bd - ad;
    })
    .slice(0, 100);

  return { all, newCount };
}

function getNewEpisodes(local: Episode[], remote: Episode[]) {
  const localIds = new Set(local.map((e) => e.id));
  return remote.filter((e) => !localIds.has(e.id));
}

/* -----------------------------
   Library actions
-------------------------------- */

export async function addToLibrary(podcast: Podcast) {
  const lib = await getLibrary();
  lib[podcast.id] = {
    ...podcast,
    artworkUrl: podcast.artworkUrl ?? pickArtwork(podcast),
    addedAt: podcast.addedAt ?? Date.now(),
    autoDownload: podcast.autoDownload ?? false,
  };
  await setLibrary(lib);
}

export async function removeFromLibrary(id: string) {
  const lib = await getLibrary();
  delete lib[id];
  await setLibrary(lib);

  const epMap = await getEpisodeMap();
  delete epMap[id];
  await writeJson(KEYS.EPISODES, epMap);

  const pins = await getPinsMap();
  delete pins[id];
  await setPinsMap(pins);
}

export async function setAutoDownload(id: string, val: boolean) {
  const lib = await getLibrary();
  const p = lib[id];
  if (!p) return;
  lib[id] = { ...p, autoDownload: val };
  await setLibrary(lib);
}

/* ✅ exported (used by screens) */
export async function refreshLibraryFeeds(): Promise<Record<string, number>> {
  const lib = await getLibrary();
  const podcasts = Object.values(lib || {});
  const epMap = await getEpisodeMap();
  const newByPodcast: Record<string, number> = {};

  for (const p of podcasts) {
    try {
      const remote = await fetchEpisodesFromFeed(p.id, p.feedUrl);
      const local = epMap[p.id] ?? [];
      const newlyFound = getNewEpisodes(local, remote);
      const merged = mergeEpisodes(local, remote);
      epMap[p.id] = merged.all;

      if (merged.newCount > 0) newByPodcast[p.id] = merged.newCount;

      // Auto-download only when enabled
      if (p.autoDownload && newlyFound.length > 0) {
        for (const ep of newlyFound) {
          if (!ep.audioUrl) continue;
          try {
            await enqueueDownload(p.id, ep);
          } catch {}
        }
      }
    } catch {}
  }

  await writeJson(KEYS.EPISODES, epMap);
  // 🔎 DEBUG: confirms episodes are being stored
  console.log("EPISODES SAVED FOR PODCASTS:", Object.keys(epMap));
  return newByPodcast;
}

/* -----------------------------
   Pins
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

export async function getPins(podcastId: string) {
  const pins = await getPinsMap();
  return pins[podcastId] ?? [];
}

/* -----------------------------
   Hook
-------------------------------- */

export function useLibrary() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newEpisodes, setNewEpisodes] = useState<Record<string, number>>({});

  const clearNewForPodcast = useCallback((id: string) => {
    setNewEpisodes((p) => {
      const c = { ...p };
      delete c[id];
      return c;
    });
  }, []);

  const reloadLibrary = useCallback(async () => {
    const map = await getLibrary();
    const list = Object.values(map || {}).sort(
      (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)
    );
    setPodcasts(list);
  }, []);

  useEffect(() => {
    reloadLibrary();
  }, [reloadLibrary]);

  const refreshLibrary = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const newMap = await refreshLibraryFeeds();
      setNewEpisodes(newMap);
      await reloadLibrary();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, reloadLibrary]);

  const updateAutoDownload = useCallback(
    async (id: string, val: boolean) => {
      await setAutoDownload(id, val);
      await reloadLibrary();
    },
    [reloadLibrary]
  );

  return {
    podcasts,
    refreshing,
    refreshLibrary,
    reloadLibrary,
    newEpisodes,
    clearNewForPodcast,
    updateAutoDownload,
  };
}
