export type ImportSongEditHref =
  | `/import/edit/${number}`
  | "/(tabs)/import/files"
  | "/(tabs)/import/save";

export type ImportSongEditInvalidReason = "invalid-id" | "not-staged";

export const getImportSongEditHref = ({
  songId,
}: {
  songId: number;
}): ImportSongEditHref => `/import/edit/${songId}`;

export const getImportSongEditSaveHref = (): ImportSongEditHref =>
  "/(tabs)/import/save";

export const getImportSongEditFilesHref = (): ImportSongEditHref =>
  "/(tabs)/import/files";

export const getImportSongEditBackLinks = () => [
  {
    href: getImportSongEditSaveHref(),
    label: "Back to save",
  },
  {
    href: getImportSongEditFilesHref(),
    label: "Back to files",
  },
] as const;

export const getImportSongEditInvalidState = (
  reason: ImportSongEditInvalidReason,
) => {
  switch (reason) {
    case "invalid-id":
      return {
        kicker: "Import edit",
        links: [
          {
            href: getImportSongEditSaveHref(),
            label: "Back to save",
          },
        ],
        subtitle: "This route needs a numeric id.",
        title: "Invalid song",
      };
    case "not-staged":
      return {
        kicker: "Import edit",
        links: [
          {
            href: getImportSongEditFilesHref(),
            label: "Back to files",
          },
          {
            href: getImportSongEditSaveHref(),
            label: "Back to save",
          },
        ],
        subtitle: "Choose songs again or return to the current review.",
        title: "Song not staged",
      };
  }
};
