import { Stack } from "expo-router";
import { Host, List, Section } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useCSSVariable } from "uniwind";

import { selectionTick } from "~/lib/haptics";
import {
  clearUpNext,
  cycleRepeat,
  moveInQueue,
  playQueueIndex,
  removeFromQueue,
  toggleShuffle,
} from "./commands";
import { usePlayer } from "./hooks";
import { currentIndex } from "./queue-model";
import { QueueRow } from "./queue-row";
import { useSourceName } from "./source-name";
import { usePlayerSongs } from "./use-player-songs";

const clearRow = [listRowBackground("clear")];

/**
 * The queue (a form sheet over the player): what it's playing from, the
 * current song, then Up Next as a native list: drag to reorder, swipe to
 * remove, tap to play. The toolbar toggles shuffle and repeat and clears
 * Up Next.
 */
export function QueueScreen() {
  const queue = usePlayer((state) => state.queue);
  const source = usePlayer((state) => state.source);
  const songs = usePlayerSongs((all) => all);
  const sourceName = useSourceName(source);
  const accent = useCSSVariable("--color-accent");
  const index = currentIndex(queue);
  const current = queue.entries[index];
  const currentSong =
    current === undefined ? undefined : songs.get(current.songId);
  const upNext = queue.entries.slice(index + 1);
  const offset = index + 1;
  return (
    <>
      <QueueToolbar canClear={upNext.length > 0} />
      <Host
        style={{ flex: 1 }}
        colorScheme="dark"
        seedColor={typeof accent === "string" ? accent : undefined}
      >
        <List
          modifiers={[listStyle("plain"), scrollContentBackground("hidden")]}
        >
          {currentSong !== undefined && (
            <Section
              title={
                sourceName === null
                  ? "Now Playing"
                  : `Playing from ${sourceName}`
              }
            >
              <QueueRow song={currentSong} modifiers={clearRow} />
            </Section>
          )}
          {upNext.length > 0 && (
            <Section title="Up Next">
              <List.ForEach
                onMove={(from, destination) => {
                  const [moved] = from;
                  if (moved === undefined) return;
                  selectionTick();
                  const to =
                    destination > moved ? destination - 1 : destination;
                  moveInQueue(offset + moved, offset + to);
                }}
                onDelete={(indices) =>
                  removeFromQueue(indices.map((i) => offset + i))
                }
              >
                {upNext.map((entry, i) => {
                  const song = songs.get(entry.songId);
                  return song === undefined ? null : (
                    <QueueRow
                      key={entry.key}
                      song={song}
                      modifiers={clearRow}
                      onPress={() => playQueueIndex(offset + i)}
                    />
                  );
                })}
              </List.ForEach>
            </Section>
          )}
        </List>
      </Host>
    </>
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
