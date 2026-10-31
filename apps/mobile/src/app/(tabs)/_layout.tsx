import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useCSSVariable } from "uniwind";

import { MiniPlayer } from "~/features/player/mini-player";
import {
  blurNativeSearch,
  focusNativeSearch,
} from "~/features/search/native-search";

/**
 * Library, Settings, and Search (iOS sets it apart as the search tab),
 * each with its own native stack, and the mini player as the tab bar's
 * bottom accessory.
 */
export default function TabsLayout() {
  const accent = useCSSVariable("--color-accent");
  return (
    <NativeTabs tintColor={typeof accent === "string" ? accent : undefined}>
      <NativeTabs.BottomAccessory>
        <MiniPlayer />
      </NativeTabs.BottomAccessory>
      <NativeTabs.Trigger name="(library)">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "music.note.house",
            selected: "music.note.house.fill",
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="search"
        role="search"
        listeners={{ blur: blurNativeSearch, focus: focusNativeSearch }}
      >
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
