import { Text, View } from "react-native";

import { SymbolIcon } from "~/components/symbol-icon";

/**
 * The tab bar's bottom accessory, like Apple Music's: what's playing, with
 * play and next. A placeholder until playback (`@synq/audio`) lands.
 */
export function MiniPlayer() {
  return (
    <View className="flex-1 flex-row items-center gap-3 px-4">
      <View className="bg-fill size-8 items-center justify-center rounded-md">
        <SymbolIcon
          name="music.note"
          size={16}
          tintColorClassName="accent-muted"
        />
      </View>
      <Text numberOfLines={1} className="text-subhead text-muted flex-1">
        Not Playing
      </Text>
      <SymbolIcon
        name="play.fill"
        size={20}
        tintColorClassName="accent-foreground"
      />
      <SymbolIcon
        name="forward.fill"
        size={20}
        tintColorClassName="accent-foreground"
      />
    </View>
  );
}
