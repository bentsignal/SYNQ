import type { LibraryCollectionListKind } from "./library-collection-list-service";
import { getLibraryCollectionCreateHref } from "./library-collection-list-service";

export type LibraryHomeHref =
  | "/(tabs)/import"
  | ReturnType<typeof getLibraryCollectionCreateHref>;

export type LibraryHomeHeaderAction = {
  href: LibraryHomeHref;
  label: string;
};

export type LibraryHomeStatusState = {
  hasErrors: boolean;
  isError: boolean;
  statusLabel: string;
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

export const getLibraryHomeStatusState = ({
  collectionUpdatedAt,
  errors,
  formatUpdatedAt = (updatedAt) =>
    new Date(updatedAt).toLocaleTimeString(),
  songUpdatedAt,
  summaryUpdatedAt,
}: {
  collectionUpdatedAt: number;
  errors: readonly unknown[];
  formatUpdatedAt?: (updatedAt: number) => string;
  songUpdatedAt?: Date | null;
  summaryUpdatedAt: number;
}): LibraryHomeStatusState => {
  const hasErrors = errors.length > 0;
  const latestUpdate = Math.max(
    summaryUpdatedAt,
    collectionUpdatedAt,
    songUpdatedAt?.getTime() ?? 0,
  );

  return {
    hasErrors,
    isError: hasErrors,
    statusLabel: hasErrors
      ? "One or more library queries failed."
      : latestUpdate > 0
        ? `Updated ${formatUpdatedAt(latestUpdate)}`
        : "Waiting for library data",
  };
};
