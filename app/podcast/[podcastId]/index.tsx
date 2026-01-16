import { View, Text, Image, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { Episode, Podcast } from "../../../src/types/podcast";
import { useTheme } from "../../../src/theme/ThemeProvider";

import { KEYS, writeJson } from "../../../src/lib/storage";
import {
  getLibrary,
  getEpisodesForPodcast,
  refreshLibraryFeeds,
} from "../../../src/state/library";

import {
  subscribeDownloads,
  getAllDownloads,
  enqueueDownload,
  pauseDownload,
  resumeDownload,
  DownloadRecord,
} from "../../../src/state/downloads";

/* ---------------- age helper ---------------- */

function formatAge(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = 1000 * 60 * 60 * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diff < day) return "NEW";
  if (diff < week) return `${Math.floor(diff / day)}d`;
  if (diff < month) return `${Math.floor(diff / week)}w`;
  if (diff < year) return `${Math.floor(diff / month)}m`;
  return `${Math.floor(diff / year)}y`;
}

/* ---------------- screen ---------------- */

export default function PodcastDetailScreen() {
  const params = useLocalSearchParams<{ podcastId?: string | string[] }>();
  const raw = Array.isArray(params.podcastId)
    ? params.podcastId[0]
    : params.podcastId;

  const podcastId = raw ? decodeURIComponent(raw) : undefined;

  const router = useRouter();
  const theme = useTheme();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [downloads, setDownloads] = useState<Record<string, DownloadRecord>>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);

  /* ---------- load podcast + episodes ---------- */

  useEffect(() => {
    if (!podcastId) return;

    let mounted = true;
    const id = podcastId;

    async function load() {
      const lib = await getLibrary();
      if (!mounted) return;

      setPodcast(lib[id] ?? null);

      const eps = await getEpisodesForPodcast(id);
      if (!mounted) return;

      setEpisodes(eps);
      setDownloads({ ...getAllDownloads() });
    }

    load();

    const unsub = subscribeDownloads(() => {
      if (mounted) {
        setDownloads({ ...getAllDownloads() });
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [podcastId]);

  /* ---------- refresh ---------- */

  async function refreshThisPodcast() {
    if (!podcastId || refreshing) return;
    setRefreshing(true);

    try {
      await refreshLibraryFeeds();
      const eps = await getEpisodesForPodcast(podcastId);
      setEpisodes(eps);
    } finally {
      setRefreshing(false);
    }
  }

  /* ---------- auto download ---------- */

  async function setAutoDownload(val: boolean) {
    if (!podcastId || !podcast) return;

    const lib = await getLibrary();
    const current = lib[podcastId];
    if (!current) return;

    lib[podcastId] = { ...current, autoDownload: val };
    await writeJson(KEYS.LIBRARY, lib);

    setPodcast({ ...current, autoDownload: val });
  }

  if (!podcastId || !podcast) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.appBackground,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.textMuted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
      {/* ---------- Header ---------- */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 26,
            fontWeight: "800",
          }}
        >
          {podcast.title}
        </Text>

        <Text style={{ color: theme.textMuted, marginTop: 2 }}>
          {podcast.publisher}
        </Text>

        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: theme.brandAccent, fontSize: 30 }}>≪</Text>
          </Pressable>

          <Pressable onPress={() => setAutoDownload(!podcast.autoDownload)}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: podcast.autoDownload
                  ? "#1f5a34"
                  : theme.surfaceRaised,
              }}
            >
              <Text
                style={{
                  color: podcast.autoDownload
                    ? "#2ecc71"
                    : theme.textMuted,
                  fontWeight: "800",
                  fontSize: 14,
                  letterSpacing: 1,
                }}
              >
                {podcast.autoDownload ? "ON" : "OFF"}
              </Text>
            </View>

            <Text
              style={{
                color: theme.brandAccent,
                fontSize: 11,
                marginTop: 4,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Auto-download
            </Text>
            <Text
              style={{
                color: theme.brandAccent,
                fontSize: 10,
                marginTop: -1,
                opacity: 0.8,
                textAlign: "center",
              }}
            >
              New episodes
            </Text>
          </Pressable>

          <Pressable onPress={refreshThisPodcast} disabled={refreshing}>
            <Text
              style={{
                color: theme.brandAccent,
                fontSize: 42,
                opacity: refreshing ? 0.5 : 1,
              }}
            >
              ⟳
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ---------- Episodes ---------- */}
      <FlatList
        data={episodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => {
          const rec = downloads[item.id];
          const progress = rec?.progress ?? 0;
          const isDone = rec?.status === "done";

          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: podcast.artworkUrl }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: theme.surface,
                }}
              />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    color: isDone
                      ? theme.textMuted
                      : theme.textPrimary,
                    fontWeight: "700",
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <Text
                  style={{
                    color: theme.textMuted,
                    marginTop: 2,
                    fontSize: 12,
                  }}
                >
                  {formatAge(item.pubDate)}
                </Text>
              </View>

              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  backgroundColor: theme.surfaceRaised,
                  overflow: "hidden",
                  marginLeft: 10,
                }}
              >
                {rec &&
                  rec.status !== "idle" &&
                  rec.status !== "error" && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${isDone ? 100 : Math.round(progress * 100)}%`,
                        backgroundColor: isDone
                          ? theme.brandAccent + "22"
                          : theme.brandAccent + "55",
                      }}
                    />
                  )}

                <Pressable
                  onPress={() => {
                    if (!rec) enqueueDownload(podcastId, item);
                    else if (
                      rec.status === "downloading" ||
                      rec.status === "queued"
                    )
                      pauseDownload(item.id);
                    else if (rec.status === "paused")
                      resumeDownload(item.id);
                  }}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!rec ? (
                    <Text
                      style={{
                        color: theme.brandAccent,
                        fontSize: 26,
                        fontWeight: "800",
                      }}
                    >
                      ⬇
                    </Text>
                  ) : rec.status === "done" ? (
                    <Text
                      style={{
                        color: theme.textMuted,
                        fontSize: 22,
                      }}
                    >
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
