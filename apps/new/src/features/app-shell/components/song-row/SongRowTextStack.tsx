import type { ReactNode } from "react";
import { Text, View, type TextStyle, type ViewStyle } from "react-native";
import type { SongRowTheme } from "./SongRowTheme";

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

