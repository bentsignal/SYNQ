import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { SongType, InfoType, PageType, ArtistType } from '@/constants/Types'
import SongModel from '@/lib/models/SongModel';
import { idgen, getExportNumber } from '@/lib/Util';
import 'react-native-get-random-values';
import { getArtistsFromMetadata } from '@/lib/controllers/ArtistController';
import { updateMetadata } from '@/lib/controllers/SongController';

export const importFiles = async (
  countdown: (value: number) => void,
  updateSize: (value: number) => void,
) => {
  const results = await DocumentPicker.getDocumentAsync({
    type: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/flac", "audio/aac"],
    multiple: true,
    copyToCacheDirectory: true
  });
  const songs: SongType[] = [];
  let song: SongType;
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  if (results.canceled === false) {
    await createImportDir();
    updateSize(results.assets.length);
    for (let i = 0; i < results.assets.length; i++) {
      countdown(results.assets.length - i);
      // Rename file
      const newUri = `${FileSystem.cacheDirectory}import/${results.assets[i].name}`;
      await FileSystem.moveAsync({
        from: results.assets[i].uri,
        to: newUri
      });
      results.assets[i].uri = newUri;
      let info: InfoType = {};
      await getAudioMetadata(results.assets[i].uri, wantedTags)
        .then((meta) => {
          info = meta;
        }).catch((error) => {
          console.log(error);
        });
      info.fileType = results.assets[i].mimeType;
      let importArtists: ArtistType[] = [];
      if (info.metadata?.artist) {
        importArtists = await getArtistsFromMetadata(info.metadata.artist);
        if (importArtists.length > 0) {
          info.metadata.artist = importArtists.map(artist => artist.name).join(', ');
        }
        else {
          info.metadata.artist = '';
        }
      }
      song = {
        'name': results.assets[i].name,
        'id': idgen(10),
        'info': info,
        'importArtists': importArtists,
        'cacheUri': results.assets[i].uri
      };
      songs.push(song);
    }
    return songs;
  }
  else {
    return songs;
  }
}

export const getWifiTransferSong = async (name: string, id: string, type: string, data: string): Promise<SongType> => {
  const destination = `${FileSystem.cacheDirectory}import/${id}${name}`;
  await FileSystem.writeAsStringAsync(destination, data, { encoding: 'base64' });
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  const info = await getAudioMetadata(destination, wantedTags);
  let importArtists: ArtistType[] = [];
  if (info.metadata?.artist) {
    importArtists = await getArtistsFromMetadata(info.metadata.artist);
    if (importArtists.length > 0) {
      info.metadata.artist = importArtists.map(artist => artist.name).join(', ');
    }
    else {
      info.metadata.artist = '';
    }
  }
  // await FileSystem.deleteAsync(destination);
  return {
    'name': name,
    'id': id,
    'data': data,
    'info': info,
    'importArtists': importArtists,
    'cacheUri': destination
  };
}

export const exportSongs = async (songs: SongType[]) => {

  const date = new Date();
  const exportNumber = await getExportNumber();
  const dir = `${FileSystem.documentDirectory}batch ${exportNumber}  -  ${date.getMonth()}.${date.getDate()}.${date.getFullYear()}`;
  let destination;

  await FileSystem.makeDirectoryAsync(dir);

  // export single song
  if (songs.length === 1) {
    const song = songs[0];
    if (song.pageType === PageType.IMPORT) {
      if (song.edited) {
        await updateMetadata(song);
        song.edited = false;
      }
      await Sharing.shareAsync(song.cacheUri);
    }
    else {
      try {
        const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.name}`;
        if (song.edited) {
          await updateMetadata(song);
          song.edited = false;
          const db = SongModel.getInstance();
          await db.songExported(Number(song.id));
          await FileSystem.writeAsStringAsync(audioPath, song.data, { encoding: 'base64' });
        }
        await Sharing.shareAsync(audioPath);
      }
      catch (error) {
        console.log('error sharing song from library: ', error);
        throw new Error('Error sharing song from library: ' + error);
      }
    }
  }
  // export multiple songs
  else if (songs.length > 1) {
    const db = SongModel.getInstance();
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].pageType === PageType.IMPORT) {
        if (songs[i].edited) {
          await updateMetadata(songs[i]);
          songs[i].edited = false;
        }
        destination = `${dir}/${songs[i].name}`;
        await FileSystem.copyAsync({ from: songs[i].cacheUri, to: destination });
      }
      else if (songs[i].pageType === PageType.LIBRARY) {
        try {
          const audioPath = `${FileSystem.documentDirectory}library/${songs[i].id}/${songs[i].name}`;
          if (songs[i].edited) {
            await updateMetadata(songs[i]);
            songs[i].edited = false;
            await db.songExported(Number(songs[i].id));
            await FileSystem.writeAsStringAsync(audioPath, songs[i].data, { encoding: 'base64' });
          }
          await FileSystem.copyAsync({ from: audioPath, to: `${dir}/${songs[i].name}` });
        }
        catch (error) {
          console.log('error copying song from library: ', error);
        }
      }
    }
    await Sharing.shareAsync(dir);
  }

  await FileSystem.deleteAsync(dir);

}

export const deleteImportSongs = async (songs: SongType[]) => {
  for (let i = 0; i < songs.length; i++) {
    if (songs[i].cacheUri) {
      await FileSystem.deleteAsync(songs[i].cacheUri);
    }
  }
}

export const createImportDir = async () => {
  try {
    const importDir = `${FileSystem.cacheDirectory}import`;
    const info = await FileSystem.getInfoAsync(importDir);
    if (info.exists) {
      await FileSystem.deleteAsync(importDir);
    }
    await FileSystem.makeDirectoryAsync(importDir);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('already exists')) {
      console.log('error creating import directory: ', error);
    }
  }
}