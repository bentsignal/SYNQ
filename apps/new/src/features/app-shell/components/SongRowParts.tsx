import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { formatDurationMs } from "../services/duration-format-service";

export type SongRowTheme = {
  border: string;
  borderSubtle: string;
  primaryText: string;
  secondaryText: string;
};

export function SongRowShell({
  children,
  isActive = false,
  minHeight = 66,
  style,
  theme,
}: {
  children: ReactNode;
  isActive?: boolean;
  minHeight?: number;
  style?: ViewStyle;
  theme: SongRowTheme;
}) {
  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.borderSubtle, minHeight },
        isActive ? { backgroundColor: theme.borderSubtle } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SongRowTextStack({
  children,
  meta,
  metaStyle,
  title,
  titleStyle,
  wrapper,
  wrapperStyle,
  theme,
}: {
  children?: ReactNode;
  meta: string;
  metaStyle?: TextStyle;
  title: string;
  titleStyle?: TextStyle;
  wrapper?: (children: ReactNode) => ReactNode;
  wrapperStyle?: ViewStyle;
  theme: SongRowTheme;
}) {
  const content = (
    <View style={[styles.rowText, wrapperStyle]}>
      <Text
        numberOfLines={1}
        style={[styles.songTitle, { color: theme.primaryText }, titleStyle]}
      >
        {title}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.songMeta, { color: theme.secondaryText }, metaStyle]}
      >
        {meta}
      </Text>
      {children}
    </View>
  );

  return wrapper ? wrapper(content) : content;
}

export function SongRowDuration({
  duration,
  theme,
}: {
  duration: number | null | undefined;
  theme: SongRowTheme;
}) {
  return (
    <Text style={[styles.duration, { color: theme.primaryText }]}>
      {formatDurationMs(duration)}
    </Text>
  );
}

export function SongRowActionButton({
  accessibilityLabel,
  backgroundColor,
  borderColor,
  disabled = false,
  label,
  minWidth = 58,
  onPress,
  textColor,
}: {
  accessibilityLabel?: string;
  backgroundColor: string;
  borderColor?: string;
  disabled?: boolean;
  label: string;
  minWidth?: number;
  onPress: () => void;
  textColor: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor,
          borderColor: borderColor ?? backgroundColor,
          minWidth,
        },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.actionText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export const songRowPartStyles = StyleSheet.create({
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  disabled: {
    opacity: 0.45,
  },
});

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.45,
  },
  duration: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    minWidth: 44,
    textAlign: "right",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  songMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
