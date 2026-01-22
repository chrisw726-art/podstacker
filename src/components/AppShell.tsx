import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View, StatusBar, Platform } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { useState } from "react";
import { useEffect } from "react";
import { usePins } from "../state/pins";
import PinModal from "./PinModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const path = usePathname();
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const pins = usePins();

  useEffect(() => {
    if (pins.pendingPin) {
      setPinModalVisible(true);
    }
  }, [pins.pendingPin]);

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

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.surface} />
      
      <View style={{ height: statusBarHeight, backgroundColor: theme.surface }} />
      
      <View style={[styles.identityRow, { backgroundColor: theme.surface }]}>
        <Image
          source={require("../../assets/branding/podstacker-logo.png")}
          resizeMode="contain"
          style={{ height: 125, width: 200, marginLeft: 1 }}
        />
        <View
          style={{
            justifyContent: "center",
            marginLeft: "auto",
            marginRight: 8
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: theme.textSecondary,
              fontWeight: "100",
              textAlign: "right",
              fontSize: 10
            }}
          >
            @byWojo.com
          </Text>
        </View>
        <Pressable 
          onPress={() => router.push("/settings")}
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8
          }}
        >
          <Text style={{ color: theme.textSecondary, fontSize: 32 }}>☰</Text>
        </Pressable>
      </View>

      <View style={[styles.navRow, { borderBottomColor: theme.divider }]}>
        <Tab label="Library" route="/library" active={isActive("library")} />
        <Tab label="Search" route="/search" active={isActive("search")} />
        <Tab
          label="Downloads"
          route="/downloads"
          active={isActive("downloads")}
        />
      </View>

      <View style={{ flex: 1, backgroundColor: theme.appBackground }}>
        {children}
      </View>
            <PinModal 
        visible={pinModalVisible} 
        onClose={() => setPinModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  identityRow: {
    height: 60,
    paddingLeft: 0,
    paddingRight: 4,
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
