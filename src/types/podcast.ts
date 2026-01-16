export type DirectorySource = "apple" | "podcastindex";

export type Podcast = {
  id: string;
  title: string;
  publisher?: string;
  artworkUrl?: string;
  feedUrl: string;
  source: DirectorySource;
  artwork?: string;
  addedAt: number;
  autoDownload?: boolean;

};

export type Episode = {
  id: string;
  podcastId: string;
  title: string;
  pubDate?: string;
  description?: string;
  audioUrl: string;
  durationSeconds?: number;
  duration?: string;

};

export type DownloadedEpisode = {
  episodeId: string;
  podcastId: string;
  localUri: string;
  downloadedAt: number;
};

export type Pin = {
  id: string;
  episodeId: string;
  podcastId: string;
  createdAt: number;
  positionSeconds: number;
  note?: string;
};
