import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SymbolIcon } from "~/components/symbol-icon";
import { cancelExport, useExportStatus } from "./progress";

/**
 * A long export's progress, over everything like a system banner, so the
 * app stays usable while it runs. Appears only when an export takes a while.
 */
export function ExportBanner() {
  const status = useExportStatus();
  const { top } = useSafeAreaInsets();
  if (status === undefined) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      pointerEvents="box-none"
      className="absolute inset-x-3"
      style={{ top: top + 4 }}
    >
      <View
        accessibilityLabel={`Exporting ${status.name}`}
        className="bg-background-elevated border-hairline border-separator gap-2 rounded-2xl py-3 pr-2 pl-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-subhead text-foreground font-semibold"
            >
              {`Exporting ${status.name}`}
            </Text>
            <Text className="text-footnote text-muted tabular-nums">
              {`${status.completed.toLocaleString("en-US")} of ${status.total.toLocaleString("en-US")}`}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel Export"
            hitSlop={8}
            className="size-8 items-center justify-center active:opacity-60"
            onPress={cancelExport}
          >
            <SymbolIcon
              name="xmark"
              size={13}
              weight="semibold"
              tintColorClassName="accent-muted"
            />
          </Pressable>
        </View>
        <View className="bg-fill mr-2 h-1 overflow-hidden rounded-full">
          <Animated.View
            className="bg-accent h-full w-full rounded-full"
            style={{
              transform: [{ scaleX: status.fraction }],
              transformOrigin: "left",
              transitionDuration: 250,
              transitionProperty: "transform",
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
}
