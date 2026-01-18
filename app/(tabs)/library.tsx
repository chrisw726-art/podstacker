import { FlatList, Pressable, Text, View, Image, Animated } from "react-native";
import { useLibrary } from "../../src/state/library";
import { refreshSinglePodcast } from "../../src/state/library";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";

export default function LibraryScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { podcasts, refreshLibrary, refreshing, newEpisodes, clearNewForPodcast, reloadLibrary } =
    useLibrary();

  const [refreshingPodcasts, setRefreshingPodcasts] = useState<Set<string>>(new Set());

  async function handleRefreshSingle(podcastId: string) {
    setRefreshingPodcasts(prev => new Set(prev).add(podcastId));
    try {
      await refreshSinglePodcast(podcastId);
      await reloadLibrary();
    } finally {
      setRefreshingPodcasts(prev => {
        const next = new Set(prev);
        next.delete(podcastId);
        return next;
      });
    }
  }

  async function handleRefreshAll() {
    // Mark all podcasts as refreshing at the start
    const allIds = podcasts.map(p => p.id);
    setRefreshingPodcasts(new Set(allIds));
    
    // Process each podcast one at a time
    for (let i = 0; i < podcasts.length; i++) {
      const podcast = podcasts[i];
      
      try {
        await refreshSinglePodcast(podcast.id);
        
        // Create a new Set with remaining podcasts (force re-render)
        const remaining = allIds.slice(i + 1);
        setRefreshingPodcasts(new Set(remaining));
        
        // Reload to show new episodes
        await reloadLibrary();
        
      } catch (error) {
        console.error(`Failed to refresh ${podcast.id}:`, error);
        
        // Still remove from spinning on error
        const remaining = allIds.slice(i + 1);
        setRefreshingPodcasts(new Set(remaining));
      }
    }
    
    // All done
    setRefreshingPodcasts(new Set());
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground, padding: 12 }}>
      {/* Top row: title + refresh all */}
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
            color: theme.textPrimary,
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          
        </Text>

        <Pressable
          onPress={handleRefreshAll}
          disabled={refreshing}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: theme.surface,
            opacity: refreshing ? 0.6 : 1,
          }}
        >
          <Text style={{ color: theme.brandPrimary, fontWeight: "700" }}>
            {refreshing ? "Refreshing…" : "Refresh All"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={podcasts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const isRefreshing = refreshingPodcasts.has(item.id);
          
          return (
            <Pressable
              onPress={() => {
                clearNewForPodcast(item.id);

                router.push({
                  pathname: "/podcast/[podcastId]",
                  params: { podcastId: item.id },
                });
              }}
              style={{
                backgroundColor: theme.surface,
                padding: 12,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: theme.surfaceVariant,
                  marginRight: 12,
                }}
              >
                {item.artworkUrl ? (
                  <Image
                    source={{ uri: item.artworkUrl }}
                    style={{ width: 65, height: 65 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 65,
                      height: 65,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: theme.textTertiary, fontWeight: "700" }}>
                      PS
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    marginTop: 4,
                    fontSize: 13,
                  }}
                  numberOfLines={1}
                >
                  {item.publisher ?? ""}
                </Text>
              </View>

              <View style={{ alignItems: "center", justifyContent: "center", marginLeft: 12 }}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRefreshSingle(item.id);
                  }}
                  disabled={isRefreshing}
                  style={{ marginBottom: 4 }}
                >
                  <SpinningRefreshIcon 
                    isSpinning={isRefreshing} 
                    color={theme.brandSecondary}
                  />
                </Pressable>

                {item.autoDownload && (
                  <View
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.brandPrimary,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.brandPrimary,
                        fontSize: 8,
                        fontWeight: "700",
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
                      minWidth: 20,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 10,
                      backgroundColor: theme.success,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 10,
                        fontWeight: "700",
                      }}
                    >
                      {newEpisodes[item.id]}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

function SpinningRefreshIcon({ isSpinning, color }: { isSpinning: boolean; color: string }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSpinning) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isSpinning]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={{
        fontSize: 18,
        color: color,
        transform: [{ rotate: spin }],
      }}
    >
      ⟳
    </Animated.Text>
  );
}
