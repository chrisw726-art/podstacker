import { KEYS, readJson, writeJson } from "../lib/storage";
import { DirectorySource } from "../types/podcast";

export type Settings = {
  defaultDirectory: DirectorySource;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
};

export async function getSettings(): Promise<Settings> {
  return readJson<Settings>(KEYS.SETTINGS, { 
    defaultDirectory: "apple",
    skipForwardSeconds: 30,
    skipBackwardSeconds: 15
  });
}

export async function setDefaultDirectory(source: DirectorySource): Promise<void> {
  const s = await getSettings();
  await writeJson(KEYS.SETTINGS, { ...s, defaultDirectory: source });
}

export async function setSkipIntervals(forward: number, backward: number): Promise<void> {
  const s = await getSettings();
  await writeJson(KEYS.SETTINGS, { ...s, skipForwardSeconds: forward, skipBackwardSeconds: backward });
}
