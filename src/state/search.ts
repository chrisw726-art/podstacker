import { useEffect, useState } from "react";
import { searchApplePodcasts } from "../lib/directories/apple";
import { searchPodcastIndex } from "../lib/directories/podcastIndex";
import { Podcast } from "../types/podcast";
import { addToLibrary, getLibrary } from "./library";
import { getSettings } from "./settings";

/* ================================
   Search State
================================ */

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Podcast[]>([]);
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());

  /* Load library ids once so we can show "In Library" */
  useEffect(() => {
    refreshLibraryIds();
  }, []);

  async function refreshLibraryIds() {
    const lib = await getLibrary();
    setLibraryIds(new Set(Object.keys(lib)));
  }

  async function search() {
    if (!query.trim()) return;

    const settings = await getSettings();
    const source = settings.defaultDirectory ?? "apple";

   const raw =
  source === "podcastindex"
    ? await searchPodcastIndex(query)
    : await searchApplePodcasts(query);

const items = Array.isArray(raw) ? raw : raw.results;

setResults(items);

  }

  async function addPodcastToLibrary(podcast: Podcast) {
    await addToLibrary(podcast);
    await refreshLibraryIds();
  }

  function isInLibrary(id: string) {
    return libraryIds.has(id);
  }

  return {
    query,
    setQuery,
    results,
    search,
    addPodcastToLibrary,
    isInLibrary
  };
}
