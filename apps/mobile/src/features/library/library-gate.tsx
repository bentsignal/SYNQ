import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
// eslint-disable-next-line no-restricted-imports -- Opening the library is the one read that can take a while (the first launch after updating from 2.5.2 imports the whole library), and the gate needs its pending and error states and a retry.
import { useQuery } from "@tanstack/react-query";

import { SymbolIcon } from "~/components/symbol-icon";
import { openLibrary } from "./database";
import { libraryOpened, revealApp } from "./launch-splash";

/** A normal launch opens the library well before this, so it never shows. */
const SHOW_PROGRESS_AFTER_MS = 600;

/**
 * Opens the library under the splash. A slow open (the 2.5.2 import) lifts it
 * as the update screen fades in, and a failure lifts it for the error.
 */
function openUnderSplash() {
  const slow = setTimeout(revealApp, SHOW_PROGRESS_AFTER_MS);
  return openLibrary().then(
    (open) => {
      clearTimeout(slow);
      libraryOpened();
      return open;
    },
    (error: unknown) => {
      clearTimeout(slow);
      revealApp();
      throw error;
    },
  );
}

/**
 * Renders the app once the library is open. Until then: the splash (so a
 * normal launch shows nothing), then the update screen while a 2.5.2
 * library imports, or an error with a retry. Never an empty library.
 */
export function LibraryGate({ children }: { children: ReactNode }) {
  const startup = useQuery({
    gcTime: Infinity,
    queryFn: openUnderSplash,
    queryKey: ["startup"],
    select: (open) => open,
    staleTime: Infinity,
  });
  if (startup.data === true) return children;
  if (startup.isError) {
    return <StartupError onRetry={() => void startup.refetch()} />;
  }
  return <StartupProgress />;
}

function StartupProgress() {
  return (
    <View className="bg-background flex-1 items-center justify-center">
      <Animated.View
        entering={FadeIn.delay(SHOW_PROGRESS_AFTER_MS).duration(260)}
        className="items-center gap-5"
      >
        <SymbolIcon
          name="arrow.triangle.2.circlepath"
          size={44}
          tintColorClassName="accent-accent"
        />
        <View className="items-center gap-2">
          <Text className="text-headline text-foreground font-semibold">
            Updating Your Library
          </Text>
          <ActivityIndicator />
        </View>
      </Animated.View>
    </View>
  );
}

function StartupError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="bg-background flex-1 items-center justify-center gap-4 px-10">
      <SymbolIcon
        name="exclamationmark.triangle"
        size={40}
        tintColorClassName="accent-muted"
      />
      <View className="items-center gap-1">
        <Text className="text-headline text-foreground text-center font-semibold">
          Couldn&apos;t Open Your Library
        </Text>
        <Text className="text-subhead text-muted text-center">
          Your music is safe. Try again in a moment.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        className="bg-fill rounded-full px-6 py-3 active:opacity-70"
        onPress={onRetry}
      >
        <Text className="text-body text-accent font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );
}
