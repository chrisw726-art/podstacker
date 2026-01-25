import { KEYS, readJson, writeJson } from "../lib/storage";

export type EpisodeProgress = {
  podcastId: string;
  episodeId: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
};

type ProgressMap = Record<string, EpisodeProgress>;

function makeKey(podcastId: string, episodeId: string) {
  return `${podcastId}::${episodeId}`;
}

async function getProgressMap(): Promise<ProgressMap> {
  return readJson<ProgressMap>(KEYS.PLAYBACK, {});
}

async function setProgressMap(map: ProgressMap) {
  await writeJson(KEYS.PLAYBACK, map);
}

/* -----------------------------
   Public API
-------------------------------- */

export async function saveEpisodeProgress(progress: EpisodeProgress) {
  const map = await getProgressMap();
  const key = makeKey(progress.podcastId, progress.episodeId);
  map[key] = progress;
  await setProgressMap(map);
}

export async function getEpisodeProgress(
  podcastId: string,
  episodeId: string
): Promise<EpisodeProgress | null> {
  const map = await getProgressMap();
  const key = makeKey(podcastId, episodeId);
  return map[key] ?? null;
}

export async function clearEpisodeProgress(
  podcastId: string,
  episodeId: string
) {
  const map = await getProgressMap();
  const key = makeKey(podcastId, episodeId);
  delete map[key];
  await setProgressMap(map);
}
