import { getPlaybackUri } from "../../src/state/downloads";
import * as FileSystem from "expo-file-system/legacy";
import { View, Text, FlatList, Pressable, Alert, Image } from "react-native";
import { useTheme } from "../../src/theme/ThemeProvider";
import { useState, useEffect, useContext } from "react";
import { 
  getAllDownloads, 
  subscribeDownloads, 
  pauseDownload, 
  resumeDownload, 
  clearAllDownloads,
  deleteDownload,
  DownloadRecord 
} from "../../src/state/downloads";
import { useRouter } from "expo-router";
import { PlayerContext } from "../../src/state/player";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DownloadsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const playerContext = useContext(PlayerContext);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [, forceUpdate] = useState(0);


  useEffect(() => {
    const updateDownloads = () => {
      const map = getAllDownloads();
      const list = Object.values(map).sort((a, b) => {
        const order: Record<string, number> = { 
          downloading: 0, 
          queued: 1, 
          done: 2, 
          paused: 3, 
          error: 4, 
          idle: 5 
        };
        return order[a.status] - order[b.status];
      });
      setDownloads(list);
    };

    updateDownloads();
    const unsubscribe = subscribeDownloads(updateDownloads);
    return () => {
      unsubscribe();
    };
  }, []);

    // Force re-render when player state changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerContext?.playing) {
        forceUpdate(prev => prev + 1);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [playerContext?.playing]);


  const handleClearAll = () => {
    Alert.alert(
      "Clear All Downloads",
      `Are you sure you want to clear all ${downloads.length} downloads? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive",
          onPress: async () => {
            await clearAllDownloads();
          }
        }
      ]
    );
  };

  const handlePlayPausePress = async (item: DownloadRecord) => {
  if (!playerContext) return;
  
  const isCurrentEpisode = playerContext.episode?.id === item.episodeId;
  
  if (isCurrentEpisode && playerContext.playing) {
    playerContext.pause();
  } else if (isCurrentEpisode && !playerContext.playing) {
    playerContext.resume();
  } else {
    // Play directly from downloads using local file
    const localUri = `${FileSystem.documentDirectory}podstacker/${item.episodeId}.mp3`;
    
    // Create minimal episode and podcast objects for player
    const episode = {
      id: item.episodeId,
      title: item.episodeTitle,
      audioUrl: item.audioUrl,
      durationSeconds: item.durationSeconds,
      duration: item.duration,
      description: "",
      pubDate: "",
      podcastId: item.podcastId,
    };
    
    const podcast = {
      id: item.podcastId,
      title: "", 
      artworkUrl: item.podcastArtwork || "",
      feedUrl: "",
      source: "apple" as const,
      addedAt: Date.now(),
    };
    
    playerContext.play(podcast, episode, localUri);
  }
};


  const handleDownloadPress = (item: DownloadRecord) => {
    if (item.status === "downloading") {
      pauseDownload(item.episodeId);
    } else if (item.status === "paused" || item.status === "error") {
      resumeDownload(item.episodeId);
    } else if (item.status === "done") {
      handlePlayPausePress(item);
    }
  };

  const formatDuration = (seconds?: number, durationString?: string) => {
    // Try using seconds first
    if (seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    
    // If no seconds, try parsing the duration string (format like "1:23:45" or "23:45")
    if (durationString) {
      const parts = durationString.split(':').map(Number);
      if (parts.length === 3) {
        // Format: H:MM:SS
        return `${parts[0]}h ${parts[1]}m`;
      } else if (parts.length === 2) {
        // Format: MM:SS
        return `${parts[0]}m`;
      }
    }
    
    return ""; // Return empty if no duration available
  };

  const renderRightActions = (episodeId: string) => {
    return (
      <View
        style={{
          backgroundColor: theme.error,
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingRight: 20,
          borderRadius: 14,
          marginLeft: 8,
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>
          Delete
        </Text>
      </View>
    );
  };

  const handleDelete = (episodeId: string) => {
  if (playerContext?.episode?.id === episodeId) {
    playerContext.release();
  }
  deleteDownload(episodeId);
};


  if (downloads.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.appBackground,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 16 }}>
          No downloads yet.
        </Text>
        <Text style={{ color: theme.textTertiary, fontSize: 14, marginTop: 8, textAlign: "center" }}>
          Download episodes from podcast pages to listen offline.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: theme.appBackground, padding: 12 }}>
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
            Downloads
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
              {downloads.length} {downloads.length === 1 ? "episode" : "episodes"}
            </Text>
            <Pressable
              onPress={handleClearAll}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: theme.error,
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 13 }}>
                Clear All
              </Text>
            </Pressable>
          </View>
        </View>

        <FlatList
          data={downloads}
          keyExtractor={(item) => item.episodeId}
          contentContainerStyle={{ paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => {
            const isCurrentEpisode = playerContext?.episode?.id === item.episodeId;
            const isPlaying = isCurrentEpisode && playerContext?.playing;
            
            return (
              <Swipeable
                renderRightActions={() => renderRightActions(item.episodeId)}
                onSwipeableOpen={() => handleDelete(item.episodeId)}
                overshootRight={false}
              >
                <Pressable
                  onPress={() => handleDownloadPress(item)}
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
                    {item.podcastArtwork ? (
                      <Image
                        source={{ uri: item.podcastArtwork }}
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
                        <Text style={{ color: theme.textTertiary, fontWeight: "700", fontSize: 20 }}>
                          🎧
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
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {item.episodeTitle}
                    </Text>

                    {/* Duration and Progress Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 4,
                      }}
                    >
                      {/* Duration on left */}
                      {item.status === "done" ? (
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                          {formatDuration(item.durationSeconds, item.duration)}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            color: theme.brandPrimary,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {item.status === "downloading" && `Downloading ${Math.round(item.progress * 100)}%`}
                          {item.status === "queued" && "Queued"}
                          {item.status === "paused" && "Paused"}
                          {item.status === "error" && "Error - Tap to retry"}
                        </Text>
                      )}

                      {/* Percent listened on right */}
                      {item.status === "done" && (
                        <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
                          0% listened
                        </Text>
                      )}
                    </View>

                    {/* Progress Bar for downloading */}
                    {(item.status === "downloading" || item.status === "queued") && (
                      <View
                        style={{
                          height: 4,
                          backgroundColor: theme.surfaceVariant,
                          borderRadius: 2,
                          marginTop: 8,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${item.progress * 100}%`,
                            backgroundColor: theme.brandPrimary,
                            borderRadius: 2,
                          }}
                        />
                      </View>
                    )}
                  </View>

                  {item.status === "done" && (
                    <Pressable
                      onPress={() => handlePlayPausePress(item)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: theme.brandPrimary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: 12,
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontSize: 18 }}>
                        {isPlaying ? "⏸" : "▶"}
                      </Text>
                    </Pressable>
                  )}
                </Pressable>
              </Swipeable>
            );
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}
