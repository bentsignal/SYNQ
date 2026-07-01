import { PageType, SourceType } from "@/src/constants/Types";

type SongOptionVisibilityInput = {
  library: boolean;
  pageType: PageType;
  premium: boolean;
  sourceId?: number;
  sourceType?: SourceType;
};

const librarySongPages = [
  PageType.LIBRARY,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
];

const queuePages = [
  PageType.LIBRARY,
  PageType.QUEUE,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
];

const editPages = [
  PageType.LIBRARY,
  PageType.IMPORT,
  PageType.ARTIST,
  PageType.ALBUM,
];

const exportPages = [
  PageType.LIBRARY,
  PageType.PLAYER,
  PageType.ARTIST,
  PageType.ALBUM,
  PageType.IMPORT,
];

const deletePages = [PageType.LIBRARY, PageType.IMPORT];

export function getSongOptionVisibility({
  library,
  pageType,
  premium,
  sourceId,
  sourceType,
}: SongOptionVisibilityInput) {
  const canExportFromPage = exportPages.includes(pageType);
  const canDeleteFromPage = deletePages.includes(pageType);

  return {
    showAddToPlaylist: librarySongPages.includes(pageType),
    showAddToQueue: queuePages.includes(pageType),
    showDelete: premium ? canDeleteFromPage : canDeleteFromPage && library,
    showEdit: editPages.includes(pageType),
    showExport: premium ? canExportFromPage : canExportFromPage && library,
    showLikedToggle: librarySongPages.includes(pageType),
    showRemoveFromPlaylist:
      [PageType.LIBRARY, PageType.PLAYER].includes(pageType) &&
      sourceId !== undefined &&
      sourceId !== 1 &&
      sourceType === SourceType.PLAYLIST,
  };
}
