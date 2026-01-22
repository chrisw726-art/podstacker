import { View, Text, Pressable, Image } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { usePlayer } from "../state/player";
import { useEffect, useState } from "react";
import { getSettings } from "../state/settings";
import { getAllDownloads } from "../state/downloads";
import { getPlaybackUri } from "../state/downloads";
import { usePins } from "../state/pins";

export default function MiniPlayer() {
  const theme = useTheme();
  const player = usePlayer();
    const pins = usePins();
  const [skipForward, setSkipForward] = useState(30);
  const [skipBackward, setSkipBackward] = useState(15);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettings();
      setSkipForward(settings.skipForwardSeconds);
      setSkipBackward(settings.skipBackwardSeconds);
    }
    loadSettings();
  }, []);

  const handleNext = () => {
    if (!player.episode) return;
    
    const downloads = getAllDownloads();
    const downloadList = Object.values(downloads).filter(d => d.status === "done");
    const currentIndex = downloadList.findIndex(d => d.episodeId === player.episode?.id);
    
    if (currentIndex >= 0 && currentIndex < downloadList.length - 1) {
      const nextDownload = downloadList[currentIndex + 1];
      const localUri = getPlaybackUri(nextDownload.episodeId, nextDownload.audioUrl);
      
      const episode = {
        id: nextDownload.episodeId,
        title: nextDownload.episodeTitle,
        audioUrl: nextDownload.audioUrl,
        durationSeconds: nextDownload.durationSeconds,
        duration: nextDownload.duration,
        description: "",
        pubDate: "",
        podcastId: nextDownload.podcastId,
      };
      
      const podcast = {
        id: nextDownload.podcastId,
        title: "",
        artworkUrl: nextDownload.podcastArtwork || "",
        feedUrl: "",
        source: "apple" as const,
        addedAt: Date.now(),
      };
      
      player.play(podcast, episode, localUri);
    }
  };

  const handlePinPress = () => {
    if (!player.episode || !player.podcast) return;
    pins.startCapture(player.positionSeconds, player.episode, player.podcast);  };

  // Mini-player is ALWAYS visible (constitution requirement)
  // When idle, shows "Tap to start listening" state
  const hasEpisode = !!player.episode;
  const progress = player.durationSeconds > 0 
    ? (player.positionSeconds / player.durationSeconds) * 100 
    : 0;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: theme.divider,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      {/* Progress bar */}
      <View
        style={{
          height: 24,
          backgroundColor: theme.surfaceVariant,
          marginBottom: 8,
          borderRadius: 2,
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: theme.brandPrimary,
            borderRadius: 2,
          }}
        />
      </View>

      {hasEpisode ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Artwork */}
          {player.podcast?.artworkUrl ? (
            <Image
              source={{ uri: player.podcast.artworkUrl }}
              style={{ width: 50, height: 50, borderRadius: 6, marginRight: 12 }}
            />
          ) : (
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 6,
                backgroundColor: theme.surfaceVariant,
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>🎧</Text>
            </View>
          )}

          {/* Info */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                color: theme.textPrimary,
                fontSize: 14,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {player.episode.title}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {player.podcast?.title || "Podcast"}
            </Text>
          </View>

          {/* Controls */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Skip Back */}
            <Pressable
              onPress={() => player.skipBackward(skipBackward)}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 20 }}>⏪</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 9, marginTop: -4 }}>
                {skipBackward}
              </Text>
            </Pressable>

            {/* Play/Pause */}
            <Pressable
              onPress={() => (player.playing ? player.pause() : player.resume())}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.brandPrimary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 20 }}>
                {player.playing ? "⏸" : "▶"}
              </Text>
            </Pressable>

            {/* Pin Button - CORE CONSTITUTION FEATURE */}
            <Pressable
              onPress={handlePinPress}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surfaceVariant,
                borderRadius: 18,
              }}
            >
              <Text style={{ fontSize: 18 }}>📌</Text>
            </Pressable>

            {/* Skip Forward */}
            <Pressable
              onPress={() => player.skipForward(skipForward)}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 20 }}>⏩</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 9, marginTop: -4 }}>
                {skipForward}
              </Text>
            </Pressable>

            {/* Next */}
            <Pressable
              onPress={handleNext}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 20 }}>⏭</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Idle state - mini-player remains visible
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
            Tap a podcast to start listening
          </Text>
        </View>
      )}
    </View>
  );
}
