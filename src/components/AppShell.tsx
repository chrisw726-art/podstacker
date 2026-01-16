import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const path = usePathname();

  function isActive(tab: string) {
    if (tab === "library") return path === "/" || path.startsWith("/library");
    if (tab === "search") return path.startsWith("/search");
    if (tab === "downloads") return path.startsWith("/downloads");
    return false;
  }

  function Tab({ label, route, active }: any) {
  return (
    <Pressable
      disabled={active}
      onPress={() => {
        if (!active) router.push(route);
      }}
      style={[
        styles.tab,
        {
          borderBottomColor: active ? theme.brandPrimary : "transparent",
          opacity: active ? 1 : 0.85
        }
      ]}
    >

        <Text
          style={{
            color: active ? theme.brandPrimary : theme.textSecondary,
            fontWeight: "700",
            fontSize: 14
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
      {/* ---------- Top identity row ---------- */}
      <View style={[styles.identityRow, { backgroundColor: theme.surface }]}>
        <Image
          source={require("../../assets/branding/podstacker-logo.png")}
          resizeMode="contain"
          style={{ height: 125, width: 240 }}
        />

        <View
  style={{
    justifyContent: "center",
    marginLeft: "auto",
    marginRight:  6
  }}
>



          <Text
            numberOfLines={1}
            style={{
              color: theme.textSecondary,
              fontWeight: "100",
              textAlign: "left"
            }}
          >
            byWojo.com
          </Text>
        </View>

        <Text style={{ color: theme.textSecondary, fontSize: 22 }}>☰</Text>
      </View>

      {/* ---------- Navigation row ---------- */}
      <View style={[styles.navRow, { borderBottomColor: theme.divider }]}>
        <Tab label="Library" route="/library" active={isActive("library")} />
        <Tab label="Search" route="/search" active={isActive("search")} />
        <Tab
          label="Downloads"
          route="/downloads"
          active={isActive("downloads")}
        />
      </View>

      {/* ---------- App content ---------- */}
      <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  navRow: {
    height: 42,
    flexDirection: "row",
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3
  }
});
