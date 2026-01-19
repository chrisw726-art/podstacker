import * as FileSystem from "expo-file-system/legacy";
import { KEYS, readJson, writeJson } from "../lib/storage";
import { Episode } from "../types/podcast";

/* --------------------------------
   Types
-------------------------------- */

export type DownloadStatus =
  | "idle"
  | "queued"
  | "downloading"
  | "paused"
  | "done"
  | "error";

export type DownloadRecord = {
  episodeId: string;
  podcastId: string;
  episodeTitle: string;
  audioUrl: string;
  status: DownloadStatus;
  progress: number;
  podcastArtwork?: string;
  durationSeconds?: number;
  duration?: string;
};

type DownloadMap = Record<string, DownloadRecord>;

/* --------------------------------
   Constants
-------------------------------- */

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}podstacker/`;
const MAX_ACTIVE = 2;

/* --------------------------------
   Storage
-------------------------------- */

async function getDownloadMap(): Promise<DownloadMap> {
  return readJson<DownloadMap>(KEYS.DOWNLOADS, {});
}

async function saveDownloadMap(map: DownloadMap) {
  await writeJson(KEYS.DOWNLOADS, map);
}

/* --------------------------------
   Manager state
-------------------------------- */

let records: DownloadMap = {};
let active: Set<string> = new Set();
let queue: string[] = [];
let resumables: Record<string, FileSystem.DownloadResumable> = {};
let listeners: Set<() => void> = new Set();

/* --------------------------------
   Init
-------------------------------- */

async function ensureDirectory() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

export async function initDownloadManager() {
  await ensureDirectory();
  records = await getDownloadMap();

  for (const id in records) {
    if (records[id].status === "downloading") {
      records[id].status = "paused";
    }
  }

  await saveDownloadMap(records);
  notify();
}

// auto init
let _initPromise: Promise<void> | null = null;

function ensureDownloadsReady() {
  if (!_initPromise) {
    _initPromise = initDownloadManager().catch(console.error);
  }
  return _initPromise;
}

/* --------------------------------
   Notify
-------------------------------- */

function notify() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {}
  }
}

/* --------------------------------
   Public subscriptions
-------------------------------- */

export function subscribeDownloads(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* --------------------------------
   Public getters
-------------------------------- */

export function getAllDownloads() {
  return records;
}

export function getDownload(episodeId: string) {
  return records[episodeId];
}

export function isEpisodeDownloaded(episodeId: string) {
  return records[episodeId]?.status === "done";
}

/* --------------------------------
   Queue helpers
-------------------------------- */

function tryStartNext() {
  if (active.size >= MAX_ACTIVE) return;

  const nextId = queue.shift();
  if (!nextId) return;

  const rec = records[nextId];
  if (!rec) return;

  startDownload(rec);
}

async function startDownload(rec: DownloadRecord) {
  try {
    rec.status = "downloading";
    rec.progress = 0;
    notify();

    const resumable =
      resumables[rec.episodeId] ??
      FileSystem.createDownloadResumable(
        rec.audioUrl,
        `${DOWNLOAD_DIR}${rec.episodeId}.mp3`,
        {},
        (p) => {
          const total = p.totalBytesExpectedToWrite || 1;
          rec.progress = p.totalBytesWritten / total;
          notify();
        }
      );

    resumables[rec.episodeId] = resumable;
    active.add(rec.episodeId);

    const result = await resumable.downloadAsync();
    if (!result?.uri) throw new Error("Download failed");

    rec.status = "done";
    rec.progress = 1;
    active.delete(rec.episodeId);

    await saveDownloadMap(records);
    notify();
    tryStartNext();
  } catch (e) {
    console.error("DOWNLOAD FAILED:", e);
    rec.status = "error";
    active.delete(rec.episodeId);
    await saveDownloadMap(records);
    notify();
    tryStartNext();
  }
}

/* --------------------------------
   Public actions
-------------------------------- */

export async function enqueueDownload(podcastId: string, ep: Episode, podcastArtwork?: string) {
  await ensureDownloadsReady();

  if (records[ep.id]) return;

  if (!ep.audioUrl) {
    console.warn("Episode missing audioUrl:", ep.title);
    return;
  }

  const rec: DownloadRecord = {
    episodeId: ep.id,
    podcastId,
    episodeTitle: ep.title,
    audioUrl: ep.audioUrl,
    status: "queued",
    progress: 0,
    podcastArtwork,
    durationSeconds: ep.durationSeconds,
    duration: ep.duration,
  };

  records[ep.id] = rec;
  queue.push(ep.id);

  await saveDownloadMap(records);
  notify();
  tryStartNext();
}

export async function pauseDownload(episodeId: string) {
  await ensureDownloadsReady();

  const rec = records[episodeId];
  if (!rec || rec.status !== "downloading") return;

  try {
    const r = resumables[episodeId];
    if (r) await r.pauseAsync();

    rec.status = "paused";
    active.delete(episodeId);

    await saveDownloadMap(records);
    notify();
    tryStartNext();
  } catch (e) {
    console.error("Pause failed:", e);
  }
}

export async function resumeDownload(episodeId: string) {
  await ensureDownloadsReady();

  const rec = records[episodeId];
  if (!rec) return;

  if (active.size >= MAX_ACTIVE) {
    rec.status = "queued";
    queue.push(episodeId);
    notify();
    return;
  }

  startDownload(rec);
}

export async function clearAllDownloads() {
  await ensureDownloadsReady();
  
  for (const id of active) {
    try {
      const r = resumables[id];
      if (r) await r.pauseAsync();
    } catch {}
  }
  
  records = {};
  active = new Set();
  queue = [];
  resumables = {};
  
  await saveDownloadMap({});
  notify();
}

export async function deleteDownload(episodeId: string) {
  await ensureDownloadsReady();
  
  if (active.has(episodeId)) {
    try {
      const r = resumables[episodeId];
      if (r) await r.pauseAsync();
    } catch {}
    active.delete(episodeId);
  }
  
  const queueIndex = queue.indexOf(episodeId);
  if (queueIndex > -1) {
    queue.splice(queueIndex, 1);
  }
  
  delete records[episodeId];
  delete resumables[episodeId];
  
  await saveDownloadMap(records);
  notify();
}

// kick init
void ensureDownloadsReady();
