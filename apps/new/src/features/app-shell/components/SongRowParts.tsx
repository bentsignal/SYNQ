import type { ReactNode } from "react";
import {
  Pressable,
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
      className="flex-row items-center gap-3 border-b px-3.5 py-2.5"
      style={[
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
    <View className="min-w-0 flex-1 gap-1" style={wrapperStyle}>
      <Text
        numberOfLines={1}
        className="text-[15px] font-extrabold leading-5"
        style={[{ color: theme.primaryText }, titleStyle]}
      >
        {title}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[13px] leading-[18px]"
        style={[{ color: theme.secondaryText }, metaStyle]}
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
    <Text
      className="min-w-11 text-right text-[13px] font-extrabold"
      style={{ color: theme.primaryText }}
    >
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
      className="min-h-9 items-center justify-center rounded-lg border px-2.5"
      style={[
        {
          backgroundColor,
          borderColor: borderColor ?? backgroundColor,
          minWidth,
        },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        className="text-xs font-extrabold uppercase"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = {
  disabled: {
    opacity: 0.45,
  },
} satisfies Record<string, ViewStyle>;
