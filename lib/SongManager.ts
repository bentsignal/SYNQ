import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { SongType, InfoType, PageType, TagsType } from '@/constants/Types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import SongDataManager from './data/SongDataManager';
import { isValidNumString, idgen } from './Util';
import { Image } from 'react-native';
import PlaylistDataManager from './data/PlaylistDataManager';
export const getCompletion = (size: number, progress: number) => {
  try {
    if (size === 0) {
      return 0;
    }
    let result = ((1 - ((progress - 1) / size)) * 100);
    if (result < 0) {
      return 0;
    }
    else if (result > 100) {
      return 100;
    }
    else {
      return result;
    }
  }
  catch (error) {
    console.error('Error getting completion percentage:', error);
    return 0;
  }
}

const getExportNumber = async () => {
  try {
    const numberString = await AsyncStorage.getItem('exportNumber');
    if (numberString && isValidNumString(numberString)) {
      let number = Number(numberString);
      number++;
      await AsyncStorage.setItem('exportNumber', number.toString());
      return number;
    }
    else {
      throw new Error('Bad data');
    }
  }
  catch (error) {
    await AsyncStorage.setItem('exportNumber', '1');
    return 1;
  }
}

const splitImageMimeAndBuffer = (image: string) => {
  // extract mime from start of string
  const infoString = image.split(/,(.*)/s)[0];
  const mimeTypeFull = infoString.split(/;(.*)/s)[0];
  const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
  // buffer after mimetype and encoding scheme
  const bufferString = image.split(/,(.*)/s)[1];
  return {
    mime: mimeType,
    buffer: bufferString
  };
}

const updateMetadata = async (song: SongType) => {

  if (song.pageType === PageType.LIBRARY) {
    // retrieve data if song is from library
    try {
      const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.name}`;
      const data = await FileSystem.readAsStringAsync(audioPath, { encoding: 'base64' });
      if (data) {
        song.data = data;
      }
    }
    catch (error) {
      console.log('error reading audio file data: ', error);
    }
    try {
      // retrieve image if it exists
      const image = await getCoverImageData(song.id, true);
      if (image && song.info && song.info.metadata) {
        song.info.metadata.artwork = image;
      }
    }
    catch (error) {
      console.log('error reading image file data: ', error);
    }
  }

  // validate data
  if (!song.data) {
    console.log('Import song with no data, return');
    return;
  }

  const NodeID3 = require('@/lib/node-id3');

  let tags: TagsType = {};

  tags.title = song.info.metadata?.name ?? '';
  tags.artist = song.info.metadata?.artist ?? '';
  tags.album = song.info.metadata?.album ?? '';
  const image = song.info.metadata?.artwork ?? '';
  if (image) {
    if (song.pageType === PageType.LIBRARY) {
      tags.APIC = {
        description: 'Album Cover',
        imageBuffer: image,
        mime: 'image/jpeg',
      };
    }
    else if (song.pageType === PageType.IMPORT) {
      const { mime, buffer } = splitImageMimeAndBuffer(image);
      if (mime && buffer) {
        tags.APIC = {
          description: 'Album Cover',
          imageBuffer: buffer,
          mime: mime,
        };
      }
    }
  }
  else {
    console.log('no image for library song export');
  }

  try {
    if (['audio/mpeg', 'audio/flac'].includes(song.info.fileType ?? '')) {
      song.data = fromByteArray(NodeID3.writeExpo(toByteArray(song.data), tags));
    }
  }
  catch (error) {
    console.log('error modiying audio file data', error);
  }

  if (song.pageType === PageType.LIBRARY) {
    if (song.info.metadata && song.info.metadata.artwork) {
      song.info.metadata.artwork = '';
    }
  }

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
      destination = `${dir}/${song.name}`;
      await FileSystem.writeAsStringAsync(destination, song.data, { encoding: 'base64' });
      await Sharing.shareAsync(destination);
    }
    else {
      try {
        const audioPath = `${FileSystem.documentDirectory}library/${song.id}/${song.name}`;
        if (song.edited) {
          await updateMetadata(song);
          song.edited = false;
          const db = SongDataManager.getInstance();
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
    const db = SongDataManager.getInstance();
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].pageType === PageType.IMPORT) {
        if (songs[i].edited) {
          await updateMetadata(songs[i]);
          songs[i].edited = false;
        }
        destination = `${dir}/${songs[i].name}`;
        await FileSystem.writeAsStringAsync(destination, songs[i].data, { encoding: 'base64' });
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
          await FileSystem.copyAsync({ from: audioPath, to: dir });
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

export const getWifiInfo = async (name: string, id: string, type: string, data: string) => {
  try {
    const destination = `${FileSystem.documentDirectory}${id}${name}`;
    await FileSystem.writeAsStringAsync(destination, data, { encoding: 'base64' });
    const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
    const info = await getAudioMetadata(destination, wantedTags);
    await FileSystem.deleteAsync(destination);
    return info;
  }
  catch (error) {
    return {
      "fileType": type,
      "format": 'id3v2.4',
      "metadata": {
        "album": '',
        "artist": '',
        "artwork": '',
        "name": ''
      }
    };
  }
}

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
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  let data;
  if (results.canceled == false) {
    updateSize(results.assets.length);
    for (let i = 0; i < results.assets.length; i++) {
      countdown(results.assets.length - i);
      data = await FileSystem.readAsStringAsync(results.assets[i].uri, { encoding: 'base64' });
      let info: InfoType = {};
      await getAudioMetadata(results.assets[i].uri, wantedTags)
        .then((meta) => {
          info = meta;
        }).catch((error) => {
          console.log(error);
        });
      info.fileType = results.assets[i].mimeType;
      songs.push({
        'name': results.assets[i].name,
        'id': idgen(10),
        'data': data,
        'info': info
      });
      await FileSystem.deleteAsync(results.assets[i].uri);
    }
    return songs;
  }
  else {
    return songs;
  }
}

export const removeSongs = (
  results: [SongType],
  ids: string[]
) => {
  let newResults = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && !ids.includes(results[i].id)) {
      newResults.push(results[i]);
    }
  }
  return newResults;
}

export const newCover = async () => {
  // TODO: import image and crop and save value to cover
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    selectionLimit: 1,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.3,
  });
  if (
    result.assets &&
    result.assets.length > 0 &&
    result.assets[0].base64 &&
    result.assets[0].mimeType &&
    (result.assets[0].mimeType == 'image/jpeg' || result.assets[0].mimeType == 'image/png') &&
    !result.canceled
  ) {
    return `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
  }
  else {
    return '';
  }
}

export const saveEdits = (

  results: SongType[],
  ids: string[],
  title: string,
  artist: string,
  album: string,
  artwork: string

) => {

  // update each song in results 
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && ids.includes(results[i].id)) {
      results[i].edited = true;
      const metadata = results[i].info?.metadata;
      let newTitle = title ? title : results[i].info.metadata?.name;
      let newArtist = artist ? artist : results[i].info.metadata?.artist;
      let newAlbum = album ? album : results[i].info.metadata?.album;
      let newArtwork = artwork ? artwork : results[i].info.metadata?.artwork;
      results[i].info.metadata = {
        name: newTitle,
        artist: newArtist,
        album: newAlbum,
        artwork: newArtwork
      };
    }
  }

  return results;

}

const createLibraryDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}library`);
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('already exists')) {
      console.log('error creating library directory: ', error);
    }
  }
}

export const deleteFromLibrary = async (id: number) => {
  try {
    const db = SongDataManager.getInstance();
    const removed = await db.removeSong(id);
    if (removed) {
      await FileSystem.deleteAsync(`${FileSystem.documentDirectory}library/${id}`);
    }
    return removed;
  }
  catch (error) {
    console.log('error deleting from library: ', error);
  }
}

export const saveToLibrary = async (
  songs: SongType[],
  progress: (value: number) => void,
) => {
  try {
    const db = SongDataManager.getInstance();
    const playlistDb = PlaylistDataManager.getInstance();
    for (let i = 0; i < songs.length; i++) {
      try {
        const song = songs[i];
        const title = song.info.metadata?.name ? song.info.metadata.name : '';
        const artists = song.info.metadata?.artist ? song.info.metadata.artist : '';
        const album = song.info.metadata?.album ? song.info.metadata.album : '';
        const artwork = song.info.metadata?.artwork ? song.info.metadata.artwork : '';
        const fileType = song.info.fileType ? song.info.fileType : '';
        const edited = song.edited ? true : false;
        let fileName = song.name ? song.name : '';
        if (fileName === '' && fileType !== '') {
          fileName = `song.${fileType}`;
        }
        const genre = 'Music';
        const duration = 0;
        // insert song into database
        const id = await db.insertSong(title, artists, album, genre, duration, fileType, fileName, edited);
        if (id !== -1) {
          // create directory and write song data if successfully inserted into DB
          await createLibraryDir();
          const dir = `${FileSystem.documentDirectory}library/${id}`;
          try {
            await FileSystem.makeDirectoryAsync(dir);
            await FileSystem.writeAsStringAsync(`${dir}/${fileName}`, song.data, { encoding: 'base64' });
          }
          catch (error) {
            console.log('error writing audio: ', error);
            // TODO: delete song from DB
            continue;
          }
          await writeImageToLibrary(artwork, dir);
          // add song to library playlist
          await playlistDb.addToPlaylist(1, id);
        }
        progress(i + 1);
      }
      catch (error) {
        console.error('Error inserting song: ', error);
        progress(i + 1);
      }
    }
  }
  catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    throw new Error('Error saving to library: ' + trace);
  }
};

export const getCoverImageData = async (id: string, full: boolean = false) => {
  try {
    const dir = `${FileSystem.documentDirectory}library/${id}`;
    const info = await FileSystem.getInfoAsync(dir);
    if (info.exists) {
      const contents = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}library/${id}`);
      const fileName = full ? 'cover_full.jpg' : 'cover_small.jpg';
      if (contents.includes(fileName)) {
        try {
          const data = await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}library/${id}/${fileName}`, { encoding: 'base64' });
          return data;
        }
        catch (error) {
          console.log('error reading cover image: ', error);
        }
      }
    }
  }
  catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    if (!(trace.includes('folder') && trace.includes("doesn't exist"))) {
      console.log('error getting cover image: ', error);
    }
  }
}

export const getSongById = async (id: number) => {
  try {
    const db = SongDataManager.getInstance();
    const result = await db.getSongById(id);
    return getSongByResult(result);
  }
  catch (error) {
    throw new Error('Error getting song by id: ' + error);
  }
}

export const getSongByResult = (result: any): SongType => {
  try {
    return {
      name: result.fileName,
      id: result.id,
      data: '',
      edited: result.edited ? true : false,
      info: {
        fileType: result.fileType,
        format: 'id3v2.4',
        name: result.name,
        metadata: {
          album: result.album,
          artist: result.artists,
          artwork: '',
          name: result.title,
        }
      }
    };
  }
  catch (error) {
    return {
      name: '',
      id: '-1',
      data: '',
      edited: false,
      info: {}
    };
  }
}

export const getNextUp = async (
  currentId: string,
  pagination: number = 30,
  shuffle: boolean = false
): Promise<SongType[]> => {

  const next: SongType[] = [];
  const db = SongDataManager.getInstance();
  // TODO: only query songs after currentId
  const songs = await db.getSongs();

  try {
    if (shuffle) {
      const cap = pagination > songs.length ? songs.length : pagination;
      for (let i = 0; i < cap; i++) {
        const randomIndex = Math.floor(Math.random() * songs.length);
        const newSong = getSongByResult(songs[randomIndex]);
        next.push(newSong);
        songs.splice(randomIndex, 1);
      }
    }
    else {
      const validSongs = songs.filter((song: SongType) => Number(song.id) > Number(currentId));
      const cap = pagination > validSongs.length ? validSongs.length : pagination;
      for (let i = 0; i < cap; i++) {
        const newSong = getSongByResult(validSongs[i]);
        next.push(newSong);
      }
    }
  }
  catch (error) {
    console.log(error);
  }

  return next;

}

export const fetchMoreSongs = async (id: string, shuffle: boolean) => {
  try {
    let newSongs = await getNextUp(id, 30, shuffle);
    if (newSongs.length < 1) {
      newSongs = await getNextUp(id, 30, true);
    }
    return newSongs;
  }
  catch (error) {
    console.log('error fetching more songs: ', error);
    return [];
  }
}

export const getNextValidSong = async (songs: number[]): Promise<SongType | null> => {
  let foundSong = false;
  let newSong = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;
  while (!foundSong && attempts < MAX_ATTEMPTS) {
    if (songs.length === 0) {
      throw new Error('No valid songs found in next up');
    }
    const newId = songs.shift();
    if (newId && newId !== -1) {
      newSong = await getSongById(newId);
      if (![null, undefined, -1, '-1'].includes(newSong.id)) {
        foundSong = true;
      }
    }
    attempts++;
  }
  return newSong;
}

export const writeImageToLibrary = async (artwork: string, dir: string) => {
  // get image file type
  if (artwork !== null && artwork !== undefined && artwork !== '') {
    const infoString = artwork.split(/,(.*)/s)[0];
    const mimeTypeFull = infoString.split(/;(.*)/s)[0];
    const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
    const buffer = artwork.split(',')[1];
    let extension = '';
    let format = SaveFormat.JPEG;
    if (mimeType === 'image/jpeg') {
      extension = 'jpg';
      format = SaveFormat.JPEG;
    }
    else if (mimeType === 'image/png') {
      extension = 'png';
      format = SaveFormat.PNG;
    }
    // write images if valid format
    if (extension !== '') {
      // write image as is
      await FileSystem.writeAsStringAsync(`${dir}/cover_temp.${extension}`, buffer, { encoding: 'base64' });
      // Get full size image dimensions
      const { width: imageWidth, height: imageHeight } = await new Promise<{ width: number, height: number }>((resolve, reject) => {
        Image.getSize(`${dir}/cover_temp.${extension}`, (width, height) => resolve({ width, height }), reject);
      });
      // convert image to jpeg, save full size
      const fullConvert = await ImageManipulator.manipulateAsync(
        `${dir}/cover_temp.${extension}`,
        [...(imageWidth > 1000 ? [{ resize: { width: 1000, height: 1000 * (imageHeight / imageWidth) } }] : [])],
        { compress: 1, format: SaveFormat.JPEG, base64: true }
      );
      if (fullConvert.base64) {
        await FileSystem.writeAsStringAsync(`${dir}/cover_full.jpg`, fullConvert.base64, { encoding: 'base64' });
      }
      // convert image to jpeg, save small size
      const smallConvert = await ImageManipulator.manipulateAsync(
        `${dir}/cover_temp.${extension}`,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 0.5, format: SaveFormat.JPEG, base64: true }
      );
      if (smallConvert.base64) {
        await FileSystem.writeAsStringAsync(`${dir}/cover_small.jpg`, smallConvert.base64, { encoding: 'base64' });
      }
      // await Sharing.shareAsync(`${dir}`);
      // delete temp image
      await FileSystem.deleteAsync(`${dir}/cover_temp.${extension}`);
    }
    else {
      console.log('invalid image format: ', mimeType);
    }
  }
  else {
    console.log('no artwork');
  }
}

export const deleteImagesFromDirectory = async (dir: string) => {
  try {
    const contents = await FileSystem.readDirectoryAsync(dir);
    if (contents.includes('cover_full.jpg')) {
      await FileSystem.deleteAsync(`${dir}/cover_full.jpg`);
    }
    if (contents.includes('cover_small.jpg')) {
      await FileSystem.deleteAsync(`${dir}/cover_small.jpg`);
    }
  }
  catch (error) {
    console.log('error deleting images from directory: ', error);
  }
}

export const updateSongsInLibrary = async (
  ids: string[],
  title: string,
  artist: string,
  album: string,
  cover: string,
) => {
  const db = SongDataManager.getInstance();
  for (let i = 0; i < ids.length; i++) {
    const dir = `${FileSystem.documentDirectory}library/${ids[i]}`;
    if (cover) {
      await deleteImagesFromDirectory(dir);
      await writeImageToLibrary(cover, dir);
    }
    if (title || artist || album) {
      await db.editSong(Number(ids[i]), title, artist, album);
    }
  }
}

export const generateSongKey = (song: SongType) => {
  if (song) {
    const name = song.info.metadata?.name ?? 'no-name';
    const artist = song.info.metadata?.artist ?? 'no-artist';
    const album = song.info.metadata?.album ?? 'no-album';
    let cover = 'no-cover';
    try {
      cover = song.info.metadata?.artwork ? song.info.metadata.artwork.substring(0, 300) : 'no-cover';
    }
    catch (error) {
      cover = 'no-cover';
    }
    return `${song.id}-${name}-${artist}-${album}-${cover}`;
  }
  return '-1';
}