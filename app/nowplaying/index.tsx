import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { addPin } from "../../src/state/library";
import { usePlayer } from "../../src/state/player";
import { Pin } from "../../src/types/podcast";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function NowPlayingScreen() {
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

    await addPin(pin);
    setNote("");
    Alert.alert("Pinned", `Saved at ${fmt(pin.positionSeconds)}`);
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Now Playing</Text>

      <Text style={{ fontWeight: "700" }}>{p.podcast?.title ?? "—"}</Text>
      <Text style={{ opacity: 0.8 }}>{p.episode?.title ?? "—"}</Text>

      <Text style={{ opacity: 0.7 }}>
        {fmt(p.positionSeconds)} / {fmt(p.durationSeconds || 0)}
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={p.playing ? p.pause : p.resume}
          style={{ padding: 12, borderWidth: 1, borderRadius: 12 }}
        >
          <Text style={{ fontWeight: "700" }}>
            {p.playing ? "Pause" : "Play"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPin}
          disabled={!canPin}
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 12,
            opacity: canPin ? 1 : 0.4
          }}
        >
          <Text style={{ fontWeight: "700" }}>Pin</Text>
        </Pressable>
      </View>

      <Text style={{ fontWeight: "700", marginTop: 10 }}>
        Optional note
      </Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Short note (optional)"
        style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
      />
    </View>
  );
}
