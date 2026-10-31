import type { Href } from "expo-router";
import type { SFSymbol } from "expo-symbols";
import { router } from "expo-router";

/** The tabs whose stacks show library screens. */
export type LibraryTab = "library" | "search";

/** A library screen, wherever it's opened from. */
export type LibraryScreen =
  | { screen: "songs" | "albums" | "artists" | "playlists" }
  | { screen: "playlist" | "album" | "artist"; id: number };

/**
 * The tab in front. Library screens open inside it, so an album opened
 * from Search stays in Search's stack and Back returns to the results.
 * The tabs layout updates it as tabs gain focus.
 */
let currentTab: LibraryTab | undefined;

export function setLibraryTab(tab: LibraryTab) {
  currentTab = tab;
}

/**
 * Where `target` lives in `tab`: the Library tab's routes are at the root
 * (`/album/3`), the Search tab's under `/search` (the same screens,
 * re-exported from `src/app/(tabs)/search`).
 */
export function libraryHref(
  target: LibraryScreen,
  tab = currentTab ?? "library",
) {
  const base = tab === "search" ? "/search" : "";
  const path =
    "id" in target
      ? `${base}/${target.screen}/${target.id}`
      : `${base}/${target.screen}`;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Built from the route files above; typed routes can't follow a computed tab prefix.
  return path as Href;
}

/** Pushes a library screen onto the current tab's stack. */
export function openLibraryScreen(target: LibraryScreen) {
  router.push(libraryHref(target));
}

/** Opens an import flow (docs/ui.md → Import): the Files picker or Wi-Fi Transfer. */
export function openImport(kind: "files" | "wifi") {
  router.push(kind === "files" ? "/import/files" : "/import/wifi");
}

/** Opens the New Playlist sheet. */
export function openNewPlaylist() {
  router.push("/new-playlist");
}

/** The Library tab's rows, in docs/ui.md's order. */
export const LIBRARY_ROWS = [
  { icon: "music.note.list", label: "Playlists", screen: "playlists" },
  { icon: "music.microphone", label: "Artists", screen: "artists" },
  { icon: "square.stack", label: "Albums", screen: "albums" },
  { icon: "music.note", label: "Songs", screen: "songs" },
] as const satisfies readonly {
  icon: SFSymbol;
  label: string;
  screen: LibraryScreen["screen"];
}[];
