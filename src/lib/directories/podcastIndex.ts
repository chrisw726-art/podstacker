import { Podcast } from "../../types/podcast";

// MVP: supported but may be unconfigured until keys are added.
const KEY = process.env.EXPO_PUBLIC_PODCASTINDEX_KEY;
const SECRET = process.env.EXPO_PUBLIC_PODCASTINDEX_SECRET;

function hasKeys() {
  return Boolean(KEY && SECRET);
}

export async function searchPodcastIndex(
  term: string
): Promise<{ configured: boolean; results: Podcast[] }> {
  if (!hasKeys()) return { configured: false, results: [] };

  // We’ll wire auth/signing next. Keeping it explicit and honest for now.
  return { configured: false, results: [] };
}
