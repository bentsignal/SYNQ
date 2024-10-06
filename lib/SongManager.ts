import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as DocumentPicker from 'expo-document-picker'
import { getAudioMetadata } from '@missingcore/audio-metadata';
import { SongType } from '@/constants/Types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import { toByteArray, fromByteArray } from 'react-native-quick-base64'
import DataManager from './DataManager';
const isValidNumString = (str: string) => {
  return !isNaN(Number(str));
}

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

export const exportSongs = async (songs: any) => {

  const date = new Date();
  const exportNumber = await getExportNumber();
  const dir = `${FileSystem.documentDirectory}batch ${exportNumber}  -  ${date.getMonth()}.${date.getDate()}.${date.getFullYear()}`;
  let destination;
  
  await FileSystem.makeDirectoryAsync(dir);
  
  if (songs.length === 1) {
    destination = `${dir}/${songs[0].name}`;
    await FileSystem.writeAsStringAsync(destination, songs[0].data, {encoding: 'base64'});
    await Sharing.shareAsync(destination);
  }
  else if (songs.length > 1) {
    for (let i = 0; i < songs.length; i++) {
      destination = `${dir}/${songs[i].name}`;
      await FileSystem.writeAsStringAsync(destination, songs[i].data, {encoding: 'base64'});
    }
    await Sharing.shareAsync(dir);
  }
  
  await FileSystem.deleteAsync(dir);

}

export const getWifiInfo = async (name: string, id: string, type: string, data: string) => {
  try {
    const destination = `${FileSystem.documentDirectory}${id}${name}`;
    await FileSystem.writeAsStringAsync(destination, data, {encoding: 'base64'});
    const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
    const info = await getAudioMetadata(destination, wantedTags);
    await FileSystem.deleteAsync(destination);
    return info;
  }
  catch (error) {
    return {
      "fileType": type,
      "format": 'mp3',
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
    type: "audio/mpeg",
    multiple: true,
    copyToCacheDirectory: true
  });
  const songs: {}[] = [];
  const wantedTags = ['artwork', 'artist', 'name', 'album'] as const;
  let data;
  if (results.canceled == false) {
    updateSize(results.assets.length);
    for (let i = 0; i < results.assets.length; i++) {
      countdown(results.assets.length - i);
      data = await FileSystem.readAsStringAsync(results.assets[i].uri, {encoding: 'base64'});
      let info = {};
      await getAudioMetadata(results.assets[i].uri, wantedTags)
        .then((meta) => {
          info = meta;
        })
        .catch((error) => {
          console.log(error);
        })
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

  const NodeID3 = require('@/lib/node-id3')

  type tagsType = {
    title?: string;
    artist?: string;
    album?: string;
    APIC?: {
      description: string;
      imageBuffer: string;
      mime: string;
    }
  }

  let tags: tagsType = {}

  let meta;
  for (let i = 0; i < results.length; i++) {
    if (results[i].id && ids.includes(results[i].id)) {

      let newTitle = '';
      let newArtist = '';
      let newAlbum = '';
      let newArtwork = '';

      if (results[i].info.metadata) {
        meta = results[i].info.metadata;
      }

      if (title) {
        newTitle = title;
        tags.title = newTitle;
      }
      else if (meta && meta.name) {
        newTitle = meta.name;
        tags.title = newTitle;
      }

      if (artist) {
        newArtist = artist;
        tags.artist = newArtist;
      }
      else if (meta && meta.artist) {
        newArtist = meta.artist;
        tags.artist = newArtist;
      }

      if (album) {
        newAlbum = album;
        tags.album = newAlbum;
      }
      else if (meta && meta.album) {
        newAlbum = meta.album;
        tags.album = newAlbum;
      }

      if (artwork) {
        newArtwork = artwork;
      }
      else if (meta && meta.artwork) {
        newArtwork = meta.artwork;
      }

      if (newArtwork) {
        // extract mime from start of string
        const infoString = newArtwork.split(/,(.*)/s)[0];
        const mimeTypeFull = infoString.split(/;(.*)/s)[0];
        const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
        // buffer after mimetype and encoding scheme
        const bufferString = newArtwork.split(/,(.*)/s)[1];
        // is this possiblly why the image is corrupting? Maybe try to pass the full
        // artwork string instead of the buffer string?
        tags.APIC = {
          description: 'Album Cover',
          imageBuffer: bufferString,
          mime: mimeType
        };
      }

      if (results[i].data) {
        const newData = fromByteArray(NodeID3.writeExpo(toByteArray(results[i].data), tags));
        results[i].data = newData;
      }

      if (results[i].info) {
        results[i].info.metadata = {
          name: newTitle,
          artist: newArtist,
          album: newAlbum,
          artwork: newArtwork
        };
      }

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

export const saveToLibrary = async (
  songs: SongType[],
  progress: (value: number) => void,
) => {
  try {
    const db = DataManager.getInstance();
    await db.initConnection();
    for (let i = 0; i < songs.length; i++) {
      try {
        const song = songs[i];
        const title = song.info.metadata?.name ? song.info.metadata.name : '';
        const artists = song.info.metadata?.artist ? song.info.metadata.artist : '';
        const album = song.info.metadata?.album ? song.info.metadata.album : '';
        const artwork = song.info.metadata?.artwork ? song.info.metadata.artwork : '';
        const fileType = song.info.fileType ? song.info.fileType : '';
        let fileName = song.name ? song.name : '';
        if (fileName === '' && fileType !== '') {
          fileName = `song.${fileType}`;
        }
        const genre = 'Music';
        const duration = 0;
        // insert song into database
        const id = await db.insertSong(title, artists, album, genre, duration, fileName);
        if (id !== -1) {
          // create directory and write song data if successfully inserted into DB
          await createLibraryDir();
          const dir = `${FileSystem.documentDirectory}library/${id}`;
          try {
            await FileSystem.makeDirectoryAsync(dir);
            await FileSystem.writeAsStringAsync(`${dir}/${fileName}`, song.data, {encoding: 'base64'});
          }
          catch (error) {
            console.log('error writing audio: ', error);
            // TODO: delete song from DB
            continue;
          }
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
              // convert image to jpeg, save full size
              const fullConvert = await ImageManipulator.manipulateAsync(
                `${dir}/cover_temp.${extension}`,
                [{ resize: { width: 1000, height: 1000 } }],
                { compress: 1, format: SaveFormat.JPEG, base64: true }
              );
              if (fullConvert.base64) {
                await FileSystem.writeAsStringAsync(`${dir}/cover_full.jpg`, fullConvert.base64, {encoding: 'base64'});
              }
              // convert image to jpeg, save small size
              const smallConvert = await ImageManipulator.manipulateAsync(
                `${dir}/cover_temp.${extension}`,
                [{ resize: { width: 200, height: 200 } }],
                { compress: 0.5, format: SaveFormat.JPEG, base64: true }
              );
              if (smallConvert.base64) {
                await FileSystem.writeAsStringAsync(`${dir}/cover_small.jpg`, smallConvert.base64, {encoding: 'base64'});
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
        progress(i+1);
      }
      catch (error) {
        console.error('Error inserting song: ', error);
        progress(i+1);
      }
    }
  }
  catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    throw new Error('Error saving to library: ' + trace);
  }
};

export const getCoverImageData = async (id: string) => {
  try {
    const contents = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}library/${id}`);
    if (contents.includes('cover_small.jpg')) {
      try {
        const data = await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}library/${id}/cover_full.jpg`, { encoding: 'base64' });
        return data;
      }
      catch (error) {
        console.log(error);
      }
    }
  }
  catch (error) {
    console.log('error: ', error);
  }
}

export const idgen = (len: number) => {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random()*10).toString();
  }
  return result;
}

export const maybeString = (value: any) => {
  return value ? value : '';
}