import { Text, View } from "react-native";
import { Stack } from "expo-router";

import { clearUpNext, cycleRepeat, toggleShuffle } from "./commands";
import { usePlayer } from "./hooks";
import { Transport } from "./player-controls";
import { QueueList } from "./queue-list";
import { currentIndex } from "./queue-model";
import { QueueRow } from "./queue-row";
import { useSourceName } from "./source-name";
import { usePlayerSongs } from "./use-player-songs";

/**
 * The queue (a form sheet over the player): previous, play/pause, and next,
 * what it's playing from, the current song, then Up Next: drag a handle to reorder, swipe to remove,
 * tap to play. The toolbar toggles shuffle and repeat and clears Up Next.
 */
export function QueueScreen() {
  const queue = usePlayer((state) => state.queue);
  const source = usePlayer((state) => state.source);
  const songs = usePlayerSongs((all) => all);
  const sourceName = useSourceName(source);
  const index = currentIndex(queue);
  const current = queue.entries[index];
  const currentSong =
    current === undefined ? undefined : songs.get(current.songId);
  const upNext = queue.entries.slice(index + 1);
  return (
    <>
      <QueueToolbar canClear={upNext.length > 0} />
      <QueueList
        entries={upNext}
        songs={songs}
        header={
          <View>
            <View className="pt-1">
              <Transport compact />
            </View>
            {currentSong !== undefined && (
              <>
                <SectionTitle
                  title={
                    sourceName === null
                      ? "Now Playing"
                      : `Playing from ${sourceName}`
                  }
                />
                <QueueRow song={currentSong} />
              </>
            )}
            {upNext.length > 0 && <SectionTitle title="Up Next" />}
          </View>
        }
      />
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-subhead text-muted px-4 pt-4 pb-1 font-semibold">
      {title}
    </Text>
  );
}

function QueueToolbar({ canClear }: { canClear: boolean }) {
  const shuffle = usePlayer((state) => state.shuffle);
  const repeat = usePlayer((state) => state.repeat);
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="shuffle"
          accessibilityLabel="Shuffle"
          selected={shuffle}
          onPress={toggleShuffle}
        />
        <Stack.Toolbar.Button
          icon={repeat === "one" ? "repeat.1" : "repeat"}
          accessibilityLabel="Repeat"
          selected={repeat !== "off"}
          onPress={cycleRepeat}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button disabled={!canClear} onPress={clearUpNext}>
          Clear
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}
