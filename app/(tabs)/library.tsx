import { FlatList, Pressable, Text, View, Image } from "react-native";
import { useLibrary } from "../../src/state/library";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useRouter } from "expo-router";

export default function LibraryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { podcasts, refreshLibrary, refreshing, newEpisodes, clearNewForPodcast } =
    useLibrary();

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground, padding: 16 }}>
      {/* Top row: title + refresh */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          Library
        </Text>

        <Pressable
          onPress={() => refreshLibrary()}
          disabled={refreshing}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: theme.surfaceRaised,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <Text style={{ color: theme.brandAccent, fontWeight: "700" }}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={podcasts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              clearNewForPodcast(item.id);

              // ✅ IMPORTANT: use params object so IDs like "apple:123" work
              router.push({
                pathname: "/podcast/[podcastId]",
                params: { podcastId: item.id },
              });
            }}
            style={{
              backgroundColor: theme.surfaceRaised,
              padding: 12,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Artwork */}
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.surface,
                marginRight: 12,
              }}
            >
              {item.artworkUrl ? (
                <Image
                  source={{ uri: item.artworkUrl }}
                  style={{ width: 46, height: 46 }}
                />
              ) : (
                <View
                  style={{
                    width: 46,
                    height: 46,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.textMuted, fontWeight: "700" }}>
                    PS
                  </Text>
                </View>
              )}
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontWeight: "700",
                    fontSize: 16,
                    flexShrink: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {item.autoDownload && (
                  <View
                    style={{
                      marginLeft: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.brandAccent,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.brandAccent,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      }}
                    >
                      AUTO
                    </Text>
                  </View>
                )}

                {newEpisodes?.[item.id] > 0 && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#2ecc71",
                      marginLeft: 8,
                    }}
                  />
                )}
              </View>

              <Text
                style={{
                  color: theme.textMuted,
                  marginTop: 4,
                  fontSize: 13,
                }}
                numberOfLines={1}
              >
                {item.publisher ?? ""}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
