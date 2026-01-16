import { XMLParser } from "fast-xml-parser";
import { Episode } from "../types/podcast";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function stableId(podcastId: string, guidOrUrl: string) {
  return `${podcastId}:${guidOrUrl}`.slice(0, 300);
}

export async function fetchEpisodesFromFeed(
  podcastId: string,
  feedUrl: string
): Promise<Episode[]> {

  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error("Failed to fetch feed");

  const xml = await res.text();
  const data = parser.parse(xml);

  const channel = data?.rss?.channel ?? data?.feed;
  const items = asArray<any>(channel?.item ?? channel?.entry);

  const episodes: Episode[] = [];

  for (const item of items) {
    const title =
      item?.title?.["#text"] ?? item?.title ?? "Untitled episode";

    const pubDate =
      item?.pubDate ?? item?.published ?? item?.updated;

    const description =
      item?.description?.["#text"] ??
      item?.description ??
      item?.summary?.["#text"] ??
      item?.summary;

    const enclosureUrl =
      item?.enclosure?.["@_url"] ?? item?.enclosure?.url;

    const linkUrl =
      item?.link?.["@_href"] ?? item?.link;

    const audioUrl = enclosureUrl || linkUrl;
    if (!audioUrl) continue;

    const guid =
      item?.guid?.["#text"] ?? item?.guid ?? audioUrl;

    const id = stableId(podcastId, String(guid));

    episodes.push({
      id,
      podcastId,
      title: String(title),
      pubDate: pubDate ? String(pubDate) : undefined,
      description: description ? String(description) : undefined,
      audioUrl: String(audioUrl)
    });
  }

  return episodes;
}
