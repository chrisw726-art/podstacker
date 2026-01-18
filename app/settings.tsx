import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useTheme, useThemeContext } from "../src/theme/ThemeProvider";

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeName, setTheme, availableThemes } = useThemeContext();

  const themeDisplayNames: Record<string, string> = {
    default: "Default",
    dark: "Dark",
    light: "Light",
    midnight: "Midnight Blue",
    sunset: "Sunset Purple",
    ocean: "Ocean Blue",
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.appBackground }}>
      <View style={[styles.container, { backgroundColor: theme.appBackground }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Theme
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Choose your preferred color theme
          </Text>

          <View style={styles.themeGrid}>
            {availableThemes.map((name) => (
              <Pressable
                key={name}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.surfaceVariant,
                    borderColor: themeName === name ? theme.brandPrimary : theme.divider,
                    borderWidth: themeName === name ? 2 : 1,
                  },
                ]}
                onPress={() => setTheme(name)}
              >
                <Text
                  style={[
                    styles.themeName,
                    {
                      color: themeName === name ? theme.brandPrimary : theme.textPrimary,
                      fontWeight: themeName === name ? "700" : "400",
                    },
                  ]}
                >
                  {themeDisplayNames[name] || name}
                </Text>
                {themeName === name && (
                  <Text style={[styles.checkmark, { color: theme.brandPrimary }]}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeGrid: {
    gap: 12,
  },
  themeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "700",
  },
});
