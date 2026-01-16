import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { searchApplePodcasts } from "../../src/lib/directories/apple";
import { searchPodcastIndex } from "../../src/lib/directories/podcastIndex";
import { addToLibrary, getLibrary } from "../../src/state/library";
import { getSettings } from "../../src/state/settings";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Podcast } from "../../src/types/podcast";

export default function SearchScreen() {
  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Podcast[]>([]);
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());

  /* ----------------------------
     Load library IDs
  ---------------------------- */
  useEffect(() => {
    refreshLibraryIds();
  }, []);

  async function refreshLibraryIds() {
    const lib = await getLibrary();
    setLibraryIds(new Set(Object.keys(lib)));
  }

  /* ----------------------------
     Search
  ---------------------------- */
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

  async function add(podcast: Podcast) {
    await addToLibrary(podcast);
    await refreshLibraryIds();
  }

  function inLibrary(id: string) {
    return libraryIds.has(id);
  }

  /* ----------------------------
     UI
  ---------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground, padding: 16 }}>
      

      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={search}
        placeholder="Search for a podcast"
        placeholderTextColor={theme.textMuted}
        style={{
          marginTop: 12,
          backgroundColor: theme.surfaceRaised,
          color: theme.textPrimary,
          padding: 12,
          borderRadius: 10
        }}
      />

      <FlatList
        style={{ marginTop: 12 }}
        data={results}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const already = inLibrary(item.id);

          return (
            <Pressable
              onPress={() => !already && add(item)}
              style={{
                backgroundColor: theme.surfaceRaised,
                padding: 14,
                borderRadius: 12,
                opacity: already ? 0.5 : 1
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                {item.title}
              </Text>

              <Text style={{ color: theme.textMuted, marginTop: 4 }}>
                {item.author}
              </Text>

              <Text style={{ color: theme.brandAccent, marginTop: 6 }}>
                {already ? "In Library" : "Add to Library"}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
