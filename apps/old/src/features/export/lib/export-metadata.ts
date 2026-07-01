import { InfoType, PageType, SongType, TagsType } from "@/src/constants/Types";
import { getImportSongCover } from "@/src/features/import/lib/import-song-edits";
import { getLibrarySongCoverPath } from "@/src/features/library/repository/library-song-repository";
import { isLibrarySongSnapshotStale } from "@/src/features/library/repository/song-metadata-repository";
import { check } from "@/src/lib/util";
import { getAudioMetadata } from "@missingcore/audio-metadata";
import * as FileSystem from "expo-file-system";
import { fromByteArray, toByteArray } from "react-native-quick-base64";

const splitImageMimeAndBuffer = (image: string) => {
  const infoString = image.split(/,(.*)/s)[0];
  const mimeTypeFull = infoString.split(/;(.*)/s)[0];
  const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
  const bufferString = image.split(/,(.*)/s)[1];

  return {
    mime: mimeType,
    buffer: bufferString,
  };
};

const getLibrarySongAudioPath = (song: SongType) => {
  if (!song.fileName) {
    return null;
  }

  return `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
};

const loadSongAudioData = async (song: SongType) => {
  if (song.pageType === PageType.IMPORT) {
    if (!song.cacheUri) {
      return;
    }

    song.data = await FileSystem.readAsStringAsync(song.cacheUri, {
      encoding: "base64",
    });
    return;
  }

  const audioPath = getLibrarySongAudioPath(song);
  if (!audioPath) {
    return;
  }

  song.data = await FileSystem.readAsStringAsync(audioPath, {
    encoding: "base64",
  });
};

const loadSongArtwork = async (song: SongType) => {
  if (song.pageType === PageType.IMPORT) {
    const cover = await getImportSongCover(song);
    if (cover) {
      if (cover.startsWith("data:")) {
        song.artwork = cover;
        return;
      }

      const image = await FileSystem.readAsStringAsync(cover, {
        encoding: "base64",
      });
      song.artwork = image || song.artwork;
    }
    return;
  }

  const path = await getLibrarySongCoverPath(song.id, true);
  if (path) {
    const image = await FileSystem.readAsStringAsync(path, {
      encoding: "base64",
    });
    song.artwork = image || song.artwork;
  }
};

const buildMetadataTags = (song: SongType) => {
  const tags: TagsType = {
    title: song.title ?? "",
    artist: song.artist ?? "",
    album: song.album ?? "",
  };

  const image = song.artwork ?? "";
  if (!image) {
    return tags;
  }

  if (
    song.pageType &&
    [PageType.LIBRARY, PageType.ARTIST, PageType.ALBUM].includes(song.pageType)
  ) {
    tags.APIC = {
      description: "Album Cover",
      imageBuffer: image,
      mime: "image/jpeg",
    };
    return tags;
  }

  if (song.pageType === PageType.IMPORT) {
    const { mime, buffer } = splitImageMimeAndBuffer(image);
    tags.APIC = {
      description: "Album Cover",
      imageBuffer: mime && buffer ? buffer : image,
      mime: mime && buffer ? mime : "image/jpeg",
    };
  }

  return tags;
};

export const updateExportSongMetadata = async (song: SongType) => {
  try {
    await loadSongAudioData(song);
    await loadSongArtwork(song);
  } catch {
    // Metadata refresh is best-effort; export can continue with current data.
  }

  if (!song.data) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const NodeID3 = require("@/src/lib/node-id3");
  const tags = buildMetadataTags(song);

  try {
    if (song.fileType && ["audio/mpeg", "audio/flac"].includes(song.fileType)) {
      song.data = fromByteArray(
        NodeID3.writeExpo(toByteArray(song.data), tags),
      );

      if (song.pageType === PageType.IMPORT) {
        if (!song.cacheUri) {
          return;
        }

        await FileSystem.writeAsStringAsync(song.cacheUri, song.data, {
          encoding: "base64",
        });
        return;
      }

      const audioPath = getLibrarySongAudioPath(song);
      if (!audioPath) {
        return;
      }

      await FileSystem.writeAsStringAsync(audioPath, song.data, {
        encoding: "base64",
      });
    }
  } catch {
    // Unsupported or malformed metadata should not block sharing the audio.
  }
};

const checkField = (oldValue?: string, newValue?: string) => {
  if (!oldValue && !newValue) {
    return false;
  }

  return oldValue !== newValue;
};

export const isExportSongEdited = async (song: SongType) => {
  if (!check(song)) {
    return null;
  }

  if (song.edited === true) {
    return true;
  }

  if (song.pageType !== PageType.IMPORT) {
    const snapshotStale = await isLibrarySongSnapshotStale(song.id);
    if (snapshotStale === true) {
      return true;
    }
  }

  const url =
    song.pageType === PageType.IMPORT ? song.cacheUri : getLibrarySongAudioPath(song);
  if (!url) {
    return null;
  }

  try {
    const wantedTags = ["name", "artist", "album"] as const;
    const info: InfoType = await getAudioMetadata(url, wantedTags);
    if (checkField(info.metadata?.name, song.title)) {
      return true;
    }

    if (checkField(info.metadata?.artist, song.artist)) {
      return true;
    }

    if (checkField(info.metadata?.album, song.album)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
