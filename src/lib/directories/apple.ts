import { Podcast } from "../../types/podcast";

export async function searchApplePodcasts(term: string): Promise<Podcast[]> {
  const q = encodeURIComponent(term.trim());
  const url = `https://itunes.apple.com/search?media=podcast&term=${q}&limit=25`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Apple search failed");

  const data = await res.json();

  const results: Podcast[] = (data?.results ?? [])
    .map((r: any) => {
      const feedUrl = r?.feedUrl;
      if (!feedUrl) return null;

      return {
        id: `apple:${r.collectionId ?? r.trackId ?? feedUrl}`,
        title: r.collectionName ?? r.trackName ?? "Unknown",
        publisher: r.artistName ?? r.collectionArtistName,
        artworkUrl: r.artworkUrl600 ?? r.artworkUrl100,
        feedUrl,
        source: "apple",
        addedAt: Date.now()
      } as Podcast;
    })
    .filter(Boolean);

  return results;
}
