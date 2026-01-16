import * as Network from "expo-network";

export async function isWifiPreferredAvailable(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true &&
      String(state.type).toLowerCase().includes("wifi");
  } catch {
    return false;
  }
}
