import { PageType, SongType } from "@/src/constants/Types";
import {
  isExportSongEdited,
  updateExportSongMetadata,
} from "@/src/features/export/lib/export-metadata";
import { getExportNumber } from "@/src/lib/util";
import SongModel from "@/src/models/SongModel";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export const exportSongs = async (songs: SongType[]) => {
  const date = new Date();
  const exportNumber = await getExportNumber();
  const dir = `${FileSystem.documentDirectory}batch ${exportNumber}  -  ${date.getMonth()}.${date.getDate()}.${date.getFullYear()}`;
  let destination;

  await FileSystem.makeDirectoryAsync(dir);

  if (songs.length === 1) {
    const song = songs[0];
    if (song.pageType === PageType.IMPORT) {
      if (!song.cacheUri) {
        throw new Error("Import song is missing a cache URI");
      }
      const edited = await isExportSongEdited(song);
      if (edited) {
        await updateExportSongMetadata(song);
        song.edited = false;
      }
      await Sharing.shareAsync(song.cacheUri);
    } else {
      try {
        if (!song.fileName) {
          throw new Error(`Library song ${song.id} has no fileName`);
        }
        const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
        const edited = await isExportSongEdited(song);
        if (edited) {
          await updateExportSongMetadata(song);
          if (!song.data) {
            throw new Error(
              `Library song ${song.id} has no audio data after metadata update`,
            );
          }
          song.edited = false;
          const db = SongModel.getInstance();
          await db.songExported(song.id);
          await FileSystem.writeAsStringAsync(audioPath, song.data, {
            encoding: "base64",
          });
        }
        await Sharing.shareAsync(audioPath);
      } catch (error) {
        console.log("error sharing song from library: ", error);
        throw new Error("Error sharing song from library: " + error);
      }
    }
  } else if (songs.length > 1) {
    const db = SongModel.getInstance();
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (song.pageType === PageType.IMPORT) {
        if (!song.cacheUri || !song.fileName) {
          continue;
        }
        const edited = await isExportSongEdited(song);
        if (edited) {
          await updateExportSongMetadata(song);
          song.edited = false;
        }
        destination = `${dir}/${song.fileName}`;
        await FileSystem.copyAsync({
          from: song.cacheUri,
          to: destination,
        });
      } else {
        try {
          if (!song.fileName) {
            continue;
          }
          const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.fileName}`;
          const edited = await isExportSongEdited(song);
          if (edited) {
            await updateExportSongMetadata(song);
            if (!song.data) {
              throw new Error(
                `Library song ${song.id} has no audio data after metadata update`,
              );
            }
            song.edited = false;
            await db.songExported(song.id);
            await FileSystem.writeAsStringAsync(audioPath, song.data, {
              encoding: "base64",
            });
          }
          await FileSystem.copyAsync({
            from: audioPath,
            to: `${dir}/${song.fileName}`,
          });
        } catch (error) {
          console.log("error copying song from library: ", error);
        }
      }
    }
    await Sharing.shareAsync(dir);
  }

  await FileSystem.deleteAsync(dir);
};
