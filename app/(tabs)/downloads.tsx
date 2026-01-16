import { View, Text } from "react-native";
import { useTheme } from "../../src/theme/ThemeProvider";

export default function DownloadsScreen() {
  const theme = useTheme();

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
      <Text style={{ color: theme.textMuted, fontSize: 16 }}>
        Downloads coming soon.
      </Text>
    </View>
  );
}
