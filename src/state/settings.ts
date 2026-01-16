import { KEYS, readJson, writeJson } from "../lib/storage";
import { DirectorySource } from "../types/podcast";

export type Settings = {
  defaultDirectory: DirectorySource;
};

export async function getSettings(): Promise<Settings> {
  return readJson<Settings>(KEYS.SETTINGS, { defaultDirectory: "apple" });
}

export async function setDefaultDirectory(source: DirectorySource): Promise<void> {
  const s = await getSettings();
  await writeJson(KEYS.SETTINGS, { ...s, defaultDirectory: source });
}
