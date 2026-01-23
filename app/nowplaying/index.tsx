import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View, Image, StyleSheet } from "react-native";
import { addPin } from "../../src/state/library";
import { usePlayer } from "../../src/state/player";
import { Pin } from "../../src/types/podcast";
import { useTheme } from "../../src/theme/ThemeProvider";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function NowPlayingScreen() {
  const theme = useTheme();
  const p = usePlayer();
  const [note, setNote] = useState("");

  const canPin = Boolean(p.podcast && p.episode);

  async function onPin() {
    if (!p.podcast || !p.episode) return;

    const pin: Pin = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      podcastId: p.podcast.id,
      episodeId: p.episode.id,
      createdAt: Date.now(),
      positionSeconds: p.positionSeconds,
      note: note.trim() ? note.trim() : undefined
    };

    await addPin(p.podcast.id, pin);

    setNote("");
    Alert.alert("Pinned", `Saved at ${fmt(pin.positionSeconds)}`);
  }

  // Show empty state if no episode is loaded
  if (!p.podcast || !p.episode) {
    return (
      <View style={[styles.container, { backgroundColor: theme.appBackground }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>
            No episode currently playing{"\n"}
            Select an episode to begin
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.appBackground }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Now Playing</Text>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: p.podcast.artworkUrl }}
          style={styles.artwork}
          accessibilityLabel={`${p.podcast.title} artwork`}
        />
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={[styles.podcastTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {p.podcast.title}
        </Text>
        <Text style={[styles.episodeTitle, { color: theme.textSecondary }]} numberOfLines={2}>
          {p.episode.title}
        </Text>
      </View>

      {/* Progress Bar & Time */}
      <View style={styles.timeSection}>
        <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.brandPrimary,
                width: `${(p.positionSeconds / (p.durationSeconds || 1)) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>
          {fmt(p.positionSeconds)} / {fmt(p.durationSeconds || 0)}
        </Text>
      </View>

      {/* Playback Controls */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={() => p.skipBackward(15)}
          style={[styles.smallButton, { backgroundColor: theme.surface }]}
          accessibilityRole="button"
          accessibilityLabel="Rewind 15 seconds"
        >
          <Text style={{ fontSize: 18 }}>⏪</Text>
        </Pressable>

        <Pressable
          onPress={p.playing ? p.pause : p.resume}
          style={[styles.playPauseButton, { backgroundColor: theme.brandPrimary }]}
          accessibilityRole="button"
          accessibilityLabel={p.playing ? "Pause" : "Play"}
        >
          <Text style={{ fontSize: 32, color: "#fff" }}>
            {p.playing ? "⏸" : "▶"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => p.skipForward(15)}
          style={[styles.smallButton, { backgroundColor: theme.surface }]}
          accessibilityRole="button"
          accessibilityLabel="Forward 15 seconds"
        >
          <Text style={{ fontSize: 18 }}>⏩</Text>
        </Pressable>
      </View>

      {/* Pin Section */}
      <View style={styles.pinSection}>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>
          Bookmark this moment
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note (optional)"
          placeholderTextColor={theme.textTertiary}
          style={[
            styles.noteInput,
            {
              borderColor: theme.divider,
              backgroundColor: theme.surface,
              color: theme.textPrimary,
            },
          ]}
        />
        <Pressable
          onPress={onPin}
          disabled={!canPin}
          style={[
            styles.pinButton,
            {
              backgroundColor: canPin ? theme.brandPrimary : theme.divider,
              opacity: canPin ? 1 : 0.5,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Save bookmark"
          accessibilityHint="Saves current playback position with optional note"
        >
          <Text
            style={[
              styles.pinButtonText,
              { color: canPin ? "#fff" : theme.textTertiary },
            ]}
          >
            📌 Save Bookmark
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  infoSection: {
    gap: 8,
    marginBottom: 20,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  episodeTitle: {
    fontSize: 15,
    opacity: 0.8,
  },
  timeSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.7,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  smallButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  pinButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  pinButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  noteInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
});
