import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LegendList } from "@legendapp/list/react-native";

import type { ImportItem, ImportSessionState } from "./session";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { ProminentButton } from "~/features/premium/prominent-button";
import mark from "../../../assets/icons/icon-blue.png";
import { progressLine } from "./progress-line";
import { useImportSession } from "./session";

function itemsOf(session: ImportSessionState) {
  return session.items;
}

function waitOf(session: ImportSessionState) {
  return session.wait;
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
    case "waiting":
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
    case "locked":
      return (
        <SymbolIcon
          name="lock.fill"
          size={15}
          tintColorClassName="accent-subtle"
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
  const dimmed = item.status === "locked" || item.status === "failed";
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

/**
 * The free tier's import wait (2.5.2's 18-second "ad"), as SYNQ's ad card:
 * the mark, the pitch, Learn More, and the wait's progress.
 */
function WaitCard({ wait }: { wait: number }) {
  const router = useRouter();
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="bg-fill mx-5 mb-2 gap-4 rounded-2xl p-5"
    >
      <View className="flex-row items-center gap-4">
        <Image
          source={mark}
          style={{ borderRadius: 11, height: 48, width: 48 }}
          accessibilityIgnoresInvertColors
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-headline text-foreground font-semibold">
            Import Instantly with Premium
          </Text>
          <Text
            className="text-subhead text-accent"
            onPress={() => {
              track("check_premium", { premium: false });
              router.push("/premium");
            }}
          >
            Learn More
          </Text>
        </View>
      </View>
      <View className="bg-fill h-1 overflow-hidden rounded-full">
        <View
          className="bg-accent h-1 rounded-full"
          style={{ transform: [{ scaleX: wait }], transformOrigin: "left" }}
        />
      </View>
    </Animated.View>
  );
}

function LockedFooter() {
  const router = useRouter();
  return (
    <View className="px-5 pt-3 pb-8">
      <ProminentButton
        label="Import All with Premium"
        onPress={() => {
          track("check_premium", { premium: false });
          router.push("/premium");
        }}
      />
    </View>
  );
}

function ListFooter({ locked }: { locked: boolean }) {
  return locked ? <LockedFooter /> : <View className="h-10" />;
}

function ListHeader({
  header,
  line,
  wait,
}: {
  header: ReactNode;
  line: string;
  wait: number | null;
}) {
  return (
    <>
      {header}
      {line !== "" && (
        <Text className="text-footnote text-muted px-5 pt-2 pb-3 tabular-nums">
          {line}
        </Text>
      )}
      {wait !== null && <WaitCard wait={wait} />}
    </>
  );
}

/**
 * An import batch as it happens: a progress line, the wait card (free
 * tier), each file as it's read and imported, and Import All with Premium
 * when songs are locked. `header` goes above (Wi-Fi Transfer's address).
 */
export function ImportList({ header }: { header?: ReactNode }) {
  const items = useImportSession(itemsOf);
  const wait = useImportSession(waitOf);
  const line = items.length > 0 ? progressLine(items) : "";
  return (
    <LegendList
      className="bg-background flex-1"
      contentInsetAdjustmentBehavior="automatic"
      data={items}
      keyExtractor={(item) => item.key}
      estimatedItemSize={64}
      recycleItems={false}
      ListHeaderComponent={
        <ListHeader header={header} line={line} wait={wait} />
      }
      ListFooterComponent={
        <ListFooter locked={items.some((item) => item.status === "locked")} />
      }
      renderItem={({ item }) => (
        <Animated.View entering={FadeIn.duration(180)}>
          <ItemRow item={item} />
        </Animated.View>
      )}
    />
  );
}
