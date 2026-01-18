import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { searchApplePodcasts } from "../../src/lib/directories/apple";
import { addToLibrary, getLibrary } from "../../src/state/library";
import { useTheme } from "../../src/theme/ThemeProvider";
import { Podcast } from "../../src/types/podcast";

type Tab = "category" | "podcast" | "country";
type ViewMode = "grid" | "results";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Country {
  id: string;
  name: string;
  flag: string;
}

const CATEGORIES: Category[] = [
  { id: "science", name: "Science", icon: "🧬" },
  { id: "history", name: "History", icon: "🏛" },
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "health", name: "Health", icon: "🌱" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "education", name: "Education", icon: "📚" },
  { id: "truecrime", name: "True Crime", icon: "🔍" },
  { id: "society", name: "Society", icon: "🌍" },
  { id: "arts", name: "Arts", icon: "🎨" },
  { id: "news", name: "News", icon: "📰" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "fiction", name: "Fiction", icon: "📖" },
  { id: "peptides", name: "Peptides", icon: "💉" },
  { id: "biohacking", name: "Biohacking", icon: "🧪" },
];

const COUNTRIES: Country[] = [
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "pl", name: "Poland", flag: "🇵🇱" },
  { id: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { id: "de", name: "Germany", flag: "🇩🇪" },
  { id: "jp", name: "Japan", flag: "🇯🇵" },
  { id: "fr", name: "France", flag: "🇫🇷" },
  { id: "ca", name: "Canada", flag: "🇨🇦" },
  { id: "au", name: "Australia", flag: "🇦🇺" },
];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("category");
  
  // Category/Country view mode
  const [categoryViewMode, setCategoryViewMode] = useState<ViewMode>("grid");
  const [countryViewMode, setCountryViewMode] = useState<ViewMode>("grid");
  
  // Selected category/country
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  
  // Search state (for Podcast tab)
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Podcast[]>([]);
  const [libraryIds, setLibraryIds] = useState<Set<string>>(new Set());
  
  // Pinned podcast (for "Find Similar")
  const [pinnedPodcast, setPinnedPodcast] = useState<Podcast | null>(null);

  /* -----------------------------
     Load library IDs
  -------------------------------- */
  useEffect(() => {
    refreshLibraryIds();
  }, []);

  async function refreshLibraryIds() {
    const lib = await getLibrary();
    setLibraryIds(new Set(Object.keys(lib)));
  }

  /* -----------------------------
     Live search for Podcast tab
  -------------------------------- */
  useEffect(() => {
    if (activeTab === "podcast" && query.trim()) {
      const timer = setTimeout(() => {
        performSearch(query);
      }, 300);
      return () => clearTimeout(timer);
    } else if (activeTab === "podcast" && !query.trim()) {
      setResults([]);
    }
  }, [query, activeTab]);

  async function performSearch(searchTerm: string) {
    if (!searchTerm.trim()) return;
    
    try {
      const results = await searchApplePodcasts(searchTerm);
      setResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
  }

  async function add(podcast: Podcast) {
    await addToLibrary(podcast);
    await refreshLibraryIds();
  }

  function inLibrary(id: string) {
    return libraryIds.has(id);
  }

  async function goToPodcastDetail(podcast: Podcast) {
    // Add to library first if not already there
    if (!inLibrary(podcast.id)) {
      await add(podcast);
    }
    
    // Then navigate
    router.push({
      pathname: "/podcast/[podcastId]",
      params: { podcastId: encodeURIComponent(podcast.id) },
    });
  }

  /* -----------------------------
     Category actions
  -------------------------------- */
  async function selectCategory(category: Category) {
    setSelectedCategory(category);
    setCategoryViewMode("results");
    setPinnedPodcast(null);
    
    try {
      const results = await searchApplePodcasts(category.id);
      setResults(results);
    } catch (error) {
      console.error("Category search error:", error);
      setResults([]);
    }
  }

  function backToCategoryGrid() {
    setCategoryViewMode("grid");
    setSelectedCategory(null);
    setPinnedPodcast(null);
    setResults([]);
  }

  /* -----------------------------
     Country actions
  -------------------------------- */
  async function selectCountry(country: Country) {
    setSelectedCountry(country);
    setCountryViewMode("results");
    setPinnedPodcast(null);
    
    try {
      const results = await searchApplePodcasts(country.name);
      setResults(results);
    } catch (error) {
      console.error("Country search error:", error);
      setResults([]);
    }
  }

  function backToCountryGrid() {
    setCountryViewMode("grid");
    setSelectedCountry(null);
    setPinnedPodcast(null);
    setResults([]);
  }

  /* -----------------------------
     Find Similar
  -------------------------------- */
  async function findSimilar(podcast: Podcast) {
    setPinnedPodcast(podcast);
    
    try {
      const results = await searchApplePodcasts(podcast.title);
      setResults(results.filter((p) => p.id !== podcast.id));
    } catch (error) {
      console.error("Find similar error:", error);
    }
  }

  /* -----------------------------
     Render folder tabs
  -------------------------------- */
  function renderFolderTabs() {
    const tabs: { key: Tab; label: string }[] = [
      { key: "category", label: "Category" },
      { key: "podcast", label: "Podcast" },
      { key: "country", label: "Country" },
    ];

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: -8,
          gap: 6,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingVertical: isActive ? 12 : 8,
                paddingHorizontal: isActive ? 18 : 14,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                backgroundColor: isActive ? theme.surfaceRaised : theme.surface,
                transform: [{ translateY: isActive ? -4 : 0 }],
              }}
            >
              <Text
                style={{
                  color: isActive ? theme.textPrimary : theme.textMuted,
                  fontWeight: isActive ? "700" : "500",
                  fontSize: isActive ? 15 : 13,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  /* -----------------------------
     Render back button + header
  -------------------------------- */
  function renderResultsHeader(
    icon: string,
    name: string,
    onBack: () => void
  ) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Pressable
          onPress={onBack}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            gap: 6,
          }}
        >
          <Text style={{ color: theme.brandAccent, fontSize: 16 }}>←</Text>
          <Text style={{ color: theme.brandAccent, fontSize: 14, fontWeight: "600" }}>
            Back
          </Text>
        </Pressable>

        <View
          style={{
            backgroundColor: theme.surface,
            padding: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 28 }}>{icon}</Text>
          <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "700" }}>
            {name}
          </Text>
        </View>
      </View>
    );
  }

  /* -----------------------------
     Render pinned podcast
  -------------------------------- */
  function renderPinnedPodcast() {
    if (!pinnedPodcast) return null;

    const already = inLibrary(pinnedPodcast.id);

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: theme.brandAccent,
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 8,
          }}
        >
          🔍 Finding Similar
        </Text>

        <View
          style={{
            backgroundColor: theme.brandAccent + "30",
            padding: 14,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.brandAccent,
            shadowColor: theme.brandAccent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
            flexDirection: "row",
            gap: 12,
          }}
        >
          {/* Thumbnail */}
          {pinnedPodcast.artworkUrl ? (
            <Image
              source={{ uri: pinnedPodcast.artworkUrl }}
              style={{ width: 60, height: 60, borderRadius: 8 }}
            />
          ) : (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: theme.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.textMuted, fontWeight: "700" }}>PS</Text>
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Pressable onPress={() => goToPodcastDetail(pinnedPodcast)}>
              <Text style={{ color: theme.textPrimary, fontWeight: "700", fontSize: 15 }}>
                {pinnedPodcast.title}
              </Text>
            </Pressable>
            <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 13 }}>
              {pinnedPodcast.publisher}
            </Text>
          </View>

          {/* Button */}
          {!already && (
            <Pressable
              onPress={() => add(pinnedPodcast)}
              style={{
                backgroundColor: theme.brandAccent,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: "700" }}>
                ADD
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  /* -----------------------------
     Render podcast list
  -------------------------------- */
  function renderPodcastList() {
    return (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.textMuted,
              textAlign: "center",
              marginTop: 40,
            }}
          >
            No podcasts found
          </Text>
        }
        renderItem={({ item }) => {
          const already = inLibrary(item.id);
          return (
            <View
              style={{
                backgroundColor: theme.surface,
                padding: 12,
                borderRadius: 12,
                flexDirection: "row",
                gap: 12,
              }}
            >
              {/* Thumbnail */}
              {item.artworkUrl ? (
                <Image
                  source={{ uri: item.artworkUrl }}
                  style={{ width: 60, height: 60, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    backgroundColor: theme.appBackground,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.textMuted, fontWeight: "700" }}>PS</Text>
                </View>
              )}

              {/* Content */}
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Pressable onPress={() => goToPodcastDetail(item)}>
                  <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                    {item.title}
                  </Text>
                </Pressable>
                <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 13 }}>
                  {item.publisher}
                </Text>
              </View>

              {/* Buttons stacked */}
              <View style={{ justifyContent: "center", gap: 4 }}>
                {!already && (
                  <Pressable
                    onPress={() => add(item)}
                    style={{
                      backgroundColor: theme.brandAccent,
                
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 4,
                      minWidth: 55,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: theme.textPrimary, fontSize: 10, fontWeight: "700" }}>
                      ADD
                    </Text>
                  </Pressable>
                )}
                
                <Pressable
                  onPress={() => findSimilar(item)}
                  style={{
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.brandAccent,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                    minWidth: 55,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: theme.brandAccent, fontSize: 10, fontWeight: "700" }}>
                    Similar
                  </Text>
                </Pressable>

                {already && (
                  <Text style={{ color: theme.textMuted, fontSize: 11, textAlign: "center" }}>
                    In Library
                  </Text>
                )}
              </View>
            </View>
          );
        }}
      />
    );
  }

  /* -----------------------------
     Render category grid
  -------------------------------- */
  function renderCategoryGrid() {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => selectCategory(cat)}
              style={{
                width: "47%",
                backgroundColor: theme.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  /* -----------------------------
     Render country grid
  -------------------------------- */
  function renderCountryGrid() {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {COUNTRIES.map((country) => (
            <Pressable
              key={country.id}
              onPress={() => selectCountry(country)}
              style={{
                width: "47%",
                backgroundColor: theme.surface,
                padding: 20,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 8 }}>{country.flag}</Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontWeight: "600",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {country.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  /* -----------------------------
     Render Category tab content
  -------------------------------- */
  function renderCategoryTab() {
    if (categoryViewMode === "grid") {
      return renderCategoryGrid();
    }

    return (
      <View style={{ flex: 1 }}>
        {selectedCategory && renderResultsHeader(
          selectedCategory.icon,
          selectedCategory.name,
          backToCategoryGrid
        )}
        {renderPinnedPodcast()}
        {renderPodcastList()}
      </View>
    );
  }

  /* -----------------------------
     Render Country tab content
  -------------------------------- */
  function renderCountryTab() {
    if (countryViewMode === "grid") {
      return renderCountryGrid();
    }

    return (
      <View style={{ flex: 1 }}>
        {selectedCountry && renderResultsHeader(
          selectedCountry.flag,
          selectedCountry.name,
          backToCountryGrid
        )}
        {renderPinnedPodcast()}
        {renderPodcastList()}
      </View>
    );
  }

  /* -----------------------------
     Render Podcast tab (direct search)
  -------------------------------- */
  function renderPodcastTab() {
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search podcasts..."
          placeholderTextColor={theme.textMuted}
          style={{
            backgroundColor: theme.surface,
            color: theme.textPrimary,
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
            fontSize: 15,
          }}
        />
        
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <Text
              style={{
                color: theme.textMuted,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              {query.trim() ? "No results found" : "Start typing to search"}
            </Text>
          }
          renderItem={({ item }) => {
            const already = inLibrary(item.id);
            return (
              <View
                style={{
                  backgroundColor: theme.surface,
                  padding: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                {/* Thumbnail */}
                {item.artworkUrl ? (
                  <Image
                    source={{ uri: item.artworkUrl }}
                    style={{ width: 60, height: 60, borderRadius: 8 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      backgroundColor: theme.appBackground,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: theme.textMuted, fontWeight: "700" }}>PS</Text>
                  </View>
                )}

                {/* Content */}
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Pressable onPress={() => goToPodcastDetail(item)}>
                    <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                      {item.title}
                    </Text>
                  </Pressable>
                  <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 13 }}>
                    {item.publisher}
                  </Text>
                </View>

                {/* Add button */}
                {!already ? (
                  <Pressable
                    onPress={() => add(item)}
                    style={{
                      backgroundColor: theme.brandAccent,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      alignSelf: "center",
                    }}
                  >
                    <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: "700" }}>
                      ADD
                    </Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: theme.textMuted, fontSize: 12, alignSelf: "center" }}>
                    In Library
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
    );
  }

  /* -----------------------------
     Main render
  -------------------------------- */
  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground, padding: 16 }}>
      {/* Folder tabs */}
      {renderFolderTabs()}

      {/* Content container with rounded top */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.surfaceRaised,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          padding: 16,
        }}
      >
        {/* Content based on active tab */}
        {activeTab === "category" && renderCategoryTab()}
        {activeTab === "podcast" && renderPodcastTab()}
        {activeTab === "country" && renderCountryTab()}
      </View>
    </View>
  );
}
