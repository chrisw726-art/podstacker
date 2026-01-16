import * as FileSystem from "expo-file-system";
import { DownloadedEpisode, Episode } from "../types/podcast";
import { KEYS, readJson, writeJson } from "./storage";

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

function safeFileName(s: string) {
  return s.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function getDownloads(): Promise<Record<string, DownloadedEpisode>> {
  return readJson<Record<string, DownloadedEpisode>>(KEYS.DOWNLOADS, {});
}

export async function isEpisodeDownloaded(
  episodeId: string
): Promise<DownloadedEpisode | null> {
  const map = await getDownloads();
  return map[episodeId] ?? null;
}

export async function downloadEpisode(ep: Episode): Promise<DownloadedEpisode> {
  await ensureDir();

  const fileName = safeFileName(ep.id) + ".mp3";
  const dest = DOWNLOAD_DIR + fileName;

  const dl = await FileSystem.downloadAsync(ep.audioUrl, dest);

  const entry: DownloadedEpisode = {
    episodeId: ep.id,
    podcastId: ep.podcastId,
    localUri: dl.uri,
    downloadedAt: Date.now()
  };

  const map = await getDownloads();
  map[ep.id] = entry;
  await writeJson(KEYS.DOWNLOADS, map);

  return entry;
}

export async function removeDownload(episodeId: string): Promise<void> {
  const map = await getDownloads();
  const existing = map[episodeId];

  if (existing?.localUri) {
    try {
      await FileSystem.deleteAsync(existing.localUri, { idempotent: true });
    } catch {}
  }

  delete map[episodeId];
  await writeJson(KEYS.DOWNLOADS, map);
}
