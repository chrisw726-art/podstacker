import { View, Text, Modal, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { usePins } from "../state/pins";

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PinModal({ visible, onClose }: PinModalProps) {
  const theme = useTheme();
  const pins = usePins();
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (note.trim()) {
      pins.savePendingPin(note.trim());
      setNote("");
      onClose();
    }
  };

  const handleCancel = () => {
    pins.dismissPending();
    setNote("");
    onClose();
  };

  if (!pins.pendingPin) return null;

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: theme.surface,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: theme.textPrimary,
              marginBottom: 16,
            }}
          >
            📌 Save Pin
          </Text>

          {/* Episode Info */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.textPrimary,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {pins.pendingPin.episode.title}
            </Text>
            <Text
              style={{ fontSize: 12, color: theme.textSecondary }}
              numberOfLines={1}
            >
              {pins.pendingPin.podcast.title}
            </Text>
          </View>

          {/* Time Range */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: theme.surfaceVariant,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 14, color: theme.textPrimary }}>
              {formatTime(pins.pendingPin.startSeconds)}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginHorizontal: 8,
              }}
            >
              →
            </Text>
            <Text style={{ fontSize: 14, color: theme.textPrimary }}>
              {formatTime(pins.pendingPin.endSeconds)}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.textSecondary,
                marginLeft: 8,
              }}
            >
              ({Math.floor(pins.pendingPin.endSeconds - pins.pendingPin.startSeconds)}s)
            </Text>
          </View>

          {/* Note Input */}
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={theme.textSecondary}
            multiline
            style={{
              backgroundColor: theme.surfaceVariant,
              borderRadius: 6,
              padding: 12,
              fontSize: 14,
              color: theme.textPrimary,
              minHeight: 80,
              marginBottom: 20,
            }}
          />

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={handleCancel}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: theme.surfaceVariant,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: theme.textPrimary }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: theme.brandPrimary,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: "#ffffff", fontWeight: "600" }}>
                Save Pin
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
