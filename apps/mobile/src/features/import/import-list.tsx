import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { LegendList } from "@legendapp/list/react-native";

import type { ImportItem, ImportSessionState } from "./session";
import { SymbolIcon } from "~/components/symbol-icon";
import { progressLine } from "./progress-line";
import { useImportSession } from "./session";

function itemsOf(session: ImportSessionState) {
  return session.items;
}

function StatusAccessory({ item }: { item: ImportItem }) {
  switch (item.status) {
    case "receiving":
      return (
        <Text className="text-footnote text-muted tabular-nums">
          {`${String(Math.round(item.received * 100))}%`}
        </Text>
      );
    case "reading":
    case "queued":
    case "importing":
      return <ActivityIndicator size="small" />;
    case "imported":
      return (
        <SymbolIcon
          name="checkmark.circle.fill"
          size={20}
          tintColorClassName="accent-accent"
        />
      );
    case "failed":
      return (
        <SymbolIcon
          name="exclamationmark.circle"
          size={19}
          tintColorClassName="accent-muted"
        />
      );
  }
}

function ItemRow({ item }: { item: ImportItem }) {
  const dimmed = item.status === "failed";
  return (
    <View
      className="h-16 flex-row items-center gap-3 px-5"
      style={{ opacity: dimmed ? 0.5 : 1 }}
    >
      <View className="bg-fill size-12 items-center justify-center overflow-hidden rounded-md">
        {item.coverUri === null ? (
          <SymbolIcon
            name="music.note"
            size={19}
            tintColorClassName="accent-subtle"
          />
        ) : (
          <Image
            source={{ uri: item.coverUri }}
            style={{ height: 48, width: 48 }}
            transition={150}
            accessibilityIgnoresInvertColors
          />
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-body text-foreground" numberOfLines={1}>
          {item.title ?? item.name}
        </Text>
        <Text className="text-subhead text-muted" numberOfLines={1}>
          {item.status === "failed"
            ? "Couldn't import this file"
            : (item.artist ?? item.name)}
        </Text>
      </View>
      <StatusAccessory item={item} />
    </View>
  );
}

function ListHeader({ header, line }: { header: ReactNode; line: string }) {
  return (
    <>
      {header}
      {line !== "" && (
        <Text className="text-footnote text-muted px-5 pt-2 pb-3 tabular-nums">
          {line}
        </Text>
      )}
    </>
  );
}

/**
 * An import batch as it happens: a progress line and each file as it's
 * read and imported. `header` goes above (Wi-Fi Transfer's address).
 */
export function ImportList({ header }: { header?: ReactNode }) {
  const items = useImportSession(itemsOf);
  const line = items.length > 0 ? progressLine(items) : "";
  return (
    <LegendList
      className="bg-background flex-1"
      contentInsetAdjustmentBehavior="automatic"
      data={items}
      keyExtractor={(item) => item.key}
      estimatedItemSize={64}
      recycleItems={false}
      ListHeaderComponent={<ListHeader header={header} line={line} />}
      ListFooterComponent={<View className="h-10" />}
      renderItem={({ item }) => (
        <Animated.View entering={FadeIn.duration(180)}>
          <ItemRow item={item} />
        </Animated.View>
      )}
    />
  );
}
