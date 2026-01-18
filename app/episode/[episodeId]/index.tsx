import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { Episode, Podcast } from "../../../src/types/podcast";
import { getEpisodesForPodcast, getLibrary } from "../../../src/state/library";
import { usePlayer } from "../../../src/state/player";

export default function EpisodeScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const player = usePlayer();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);

  useEffect(() => {
    async function load() {
      if (!episodeId) return;

      const lib = await getLibrary();
      
      for (const pod of Object.values(lib)) {
        const episodes = await getEpisodesForPodcast(pod.id);
        const found = episodes.find((ep) => ep.id === episodeId);
        
        if (found) {
          setEpisode(found);
          setPodcast(pod);
          return;
        }
      }
    }

    load();
  }, [episodeId]);

  if (!episode || !podcast) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.appBackground,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.brandAccent, fontSize: 30, marginBottom: 16 }}>
            ≪
          </Text>
        </Pressable>

        <Text style={{ color: theme.textMuted, fontSize: 14, marginBottom: 8 }}>
          {podcast.title}
        </Text>

        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 24,
            fontWeight: "800",
            marginBottom: 16,
          }}
        >
          {episode.title}
        </Text>

        {episode.description && (
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 15,
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {episode.description}
          </Text>
        )}

        <Pressable
          onPress={() => {
            if (episode.audioUrl) {
              player.play(podcast, episode, episode.audioUrl);
            }
          }}
          style={{
            backgroundColor: theme.brandAccent,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            ▶ Play Episode
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
