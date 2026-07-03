import type { LibraryCollectionListKind } from "./library-collection-list-service";
import { getLibraryCollectionCreateHref } from "./library-collection-list-service";

export type LibraryHomeHref =
  | "/(tabs)/import"
  | ReturnType<typeof getLibraryCollectionCreateHref>;

export type LibraryHomeHeaderAction = {
  href: LibraryHomeHref;
  label: string;
};

const createCollectionAction = ({
  kind,
  label,
}: {
  kind: LibraryCollectionListKind;
  label: string;
}): LibraryHomeHeaderAction => ({
  href: getLibraryCollectionCreateHref(kind),
  label,
});

export const getLibraryHomeImportHref = (): LibraryHomeHref =>
  "/(tabs)/import";

export const getLibraryHomeHeaderActions = (): LibraryHomeHeaderAction[] => [
  {
    href: getLibraryHomeImportHref(),
    label: "Import music",
  },
  createCollectionAction({
    kind: "playlists",
    label: "Create playlist",
  }),
  createCollectionAction({
    kind: "albums",
    label: "Create album",
  }),
  createCollectionAction({
    kind: "artists",
    label: "Create artist",
  }),
];

export const getLibraryHomeHeaderState = () => ({
  actions: getLibraryHomeHeaderActions(),
  kicker: "Music Library",
  subtitle:
    "Browse your songs, playlists, albums, and artists as your collection grows.",
  title: "Library",
});
