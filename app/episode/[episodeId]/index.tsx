import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { getPins } from "../../../src/state/library";
import { usePlayer } from "../../../src/state/player";
import { Pin } from "../../../src/types/podcast";

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function EpisodeScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const [pins, setPins] = useState<Pin[]>([]);
  const player = usePlayer();

  async function refresh() {
    const map = await getPins();
    setPins(map[episodeId] ?? []);
  }

  useEffect(() => {
    refresh();
  }, [episodeId]);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Pins</Text>
      <Text style={{ opacity: 0.7 }}>Episode: {episodeId}</Text>

      <FlatList
        data={pins}
        keyExtractor={(p) => p.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>{fmt(item.positionSeconds)}</Text>
            {!!item.note && <Text style={{ opacity: 0.8 }}>{item.note}</Text>}

            <Pressable
              onPress={() => player.seekTo(item.positionSeconds)}
              style={{ padding: 10, borderWidth: 1, borderRadius: 10, alignSelf: "flex-start" }}
            >
              <Text style={{ fontWeight: "700" }}>Jump to timestamp</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No pins yet.</Text>}
      />
    </View>
  );
}
