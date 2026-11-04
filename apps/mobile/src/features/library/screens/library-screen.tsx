import { useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";

import type { HomeItem } from "@synq/db";
import {
  findLikedPlaylistId,
  hasSongs,
  listPinned,
  listRecents,
} from "@synq/db";

import { EmptyState } from "~/components/empty-state";
import { HeaderGlass } from "~/components/header-glass";
import { ScreenList } from "~/components/screen-list";
import { ScreenScroll } from "~/components/screen-scroll";
import { RootTabTitle } from "~/components/tab-title";
import { playsArrive, playsLeave } from "~/features/player/record-play";
import { HomeCard } from "../home-card";
import { CARD_GAP, CARD_PADDING, cardHeight } from "../home-layout";
import { RECENTS_KEY } from "../home-queries";
import { LibraryLinkRow } from "../library-link-row";
import {
  DOWNLOAD_ACTION,
  IMPORT_ACTIONS,
  LIBRARY_ROWS,
  openImport,
  openLibraryScreen,
  openNewPlaylist,
} from "../links";
import { useLibraryQuery } from "../queries";

/** How many more of Recents load each time the list nears its end. */
const RECENTS_PAGE = 40;
/** The heading's text and the space around it. */
const HEADING_HEIGHT = 64;
/** The space under a row of cards. */
const CARD_ROW_GAP = 20;

type HomeRow =
  | { type: "heading"; key: string; title: string }
  | { type: "card"; key: string; item: HomeItem; column: number };

/**
 * A titled section as list rows: its heading across both columns, then its
 * cards. Keyed by what each card is, so when something moves, the cards around
 * it keep their views and their artwork rather than loading each other's.
 */
function sectionRows(name: string, title: string, items: readonly HomeItem[]) {
  if (items.length === 0) return [];
  const heading = { key: name, title, type: "heading" } satisfies HomeRow;
  const cards = items.map(
    (item, index) =>
      ({
        column: index % 2,
        item,
        key: `${item.kind}:${String(item.id)}`,
        type: "card",
      }) satisfies HomeRow,
  );
  return [heading, ...cards];
}

function LikedSongsRow() {
  const likedId = useLibraryQuery({
    key: ["liked-id"],
    read: findLikedPlaylistId,
    select: (id) => id,
  });
  if (likedId === null) return null;
  return (
    <LibraryLinkRow
      icon="heart"
      label="Liked Songs"
      onPress={() => openLibraryScreen({ id: likedId, screen: "playlist" })}
    />
  );
}

function LibraryLinks() {
  return (
    <View className="pt-2">
      <LikedSongsRow />
      {LIBRARY_ROWS.map((row) => (
        <LibraryLinkRow
          key={row.screen}
          icon={row.icon}
          label={row.label}
          onPress={() => openLibraryScreen({ screen: row.screen })}
        />
      ))}
    </View>
  );
}

function LibraryToolbar() {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon="plus" accessibilityLabel="Add Music">
        <Stack.Toolbar.Menu inline>
          <Stack.Toolbar.MenuAction
            icon="folder"
            onPress={() => openImport("files")}
          >
            Import from Files
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="wifi"
            onPress={() => openImport("wifi")}
          >
            Wi-Fi Transfer
          </Stack.Toolbar.MenuAction>
          {DOWNLOAD_ACTION !== null ? (
            <Stack.Toolbar.MenuAction
              icon="arrow.down.circle"
              onPress={DOWNLOAD_ACTION.onPress}
            >
              {DOWNLOAD_ACTION.label}
            </Stack.Toolbar.MenuAction>
          ) : null}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.MenuAction
          icon="music.note.list"
          onPress={openNewPlaylist}
        >
          New Playlist
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

/** Liked Songs and the library's lists, then Pinned, then Recents, loading as it scrolls. */
function LibraryHome() {
  const { width } = useWindowDimensions();
  const size = Math.floor((width - CARD_PADDING * 2 - CARD_GAP) / 2);
  // How much of Recents to show. It's one read of the whole window rather than
  // pages kept side by side, so something played moves up without a duplicate
  // or a gap.
  const [limit, setLimit] = useState(RECENTS_PAGE);
  const pinned = useLibraryQuery({
    key: ["pinned"],
    read: listPinned,
    select: (items) => items,
  });
  const recents = useLibraryQuery({
    key: [...RECENTS_KEY, limit],
    read: (db) => listRecents(db, { limit }),
    select: (window) => window,
  });
  // Recents only changes if this page was at the very top when it was left, so
  // coming back to somewhere further down finds everything where it was.
  const atTop = useRef(true);
  useFocusEffect(() => {
    playsArrive(() => atTop.current);
    return playsLeave;
  });
  const rows = [
    ...sectionRows("pinned", "Pinned", pinned),
    ...sectionRows("recents", "Recents", recents.items),
  ];
  return (
    <ScreenList
      data={rows}
      numColumns={2}
      holdThroughMoves
      onAtTopChange={(next) => {
        atTop.current = next;
      }}
      keyExtractor={(row) => row.key}
      getItemType={(row) => row.type}
      overrideItemLayout={(layout, row) => {
        layout.span = row.type === "heading" ? 2 : 1;
      }}
      getFixedItemSize={(row) =>
        row.type === "heading"
          ? HEADING_HEIGHT
          : cardHeight(size) + CARD_ROW_GAP
      }
      estimatedItemSize={cardHeight(size) + CARD_ROW_GAP}
      ListHeaderComponent={<LibraryLinks />}
      ListFooterComponent={<View className="h-8" />}
      onEndReached={() => {
        if (recents.hasMore) setLimit(limit + RECENTS_PAGE);
      }}
      onEndReachedThreshold={1}
      renderItem={({ item: row }) =>
        row.type === "heading" ? (
          <View
            className="justify-end px-4 pb-3"
            style={{ height: HEADING_HEIGHT }}
          >
            <Text className="text-foreground text-[22px] font-bold">
              {row.title}
            </Text>
          </View>
        ) : (
          // Half the screen each: the outer edges take the padding, and the
          // gap is shared between the two.
          <View
            style={{
              paddingLeft: row.column === 0 ? CARD_PADDING : CARD_GAP / 2,
            }}
          >
            <HomeCard item={row.item} size={size} />
          </View>
        )
      }
    />
  );
}

/**
 * The Library tab (docs/ui.md → Library). With no music yet, an invitation to
 * import.
 */
export default function LibraryScreen() {
  const hasMusic = useLibraryQuery({
    key: ["has-songs"],
    read: hasSongs,
    select: (has) => has,
  });
  return (
    <>
      <RootTabTitle title="Library" />
      <LibraryToolbar />
      {hasMusic ? (
        <LibraryHome />
      ) : (
        <ScreenScroll>
          <EmptyState
            icon="music.note.house"
            title="No Music Yet"
            actions={IMPORT_ACTIONS}
          />
        </ScreenScroll>
      )}
      <HeaderGlass />
    </>
  );
}
