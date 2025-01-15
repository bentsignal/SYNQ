import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SaveFormat } from 'expo-image-manipulator';
import { Image } from 'react-native';
import 'react-native-get-random-values';
import { getAlbumsFromSong } from '@/src/controllers/AlbumController';

export const splitImageMimeAndBuffer = (image: string) => {
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

export const getSongCover = async (id: string, full: boolean = false) => {
  try {
    const dir = `${FileSystem.documentDirectory}library/${id}`;
    const info = await FileSystem.getInfoAsync(dir);
    if (info.exists) {
      const contents = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}library/${id}`);
      const fileName = full ? 'cover_full.jpg' : 'cover_small.jpg';
      if (contents.includes(fileName)) {
        try {
          const path = `${FileSystem.documentDirectory}library/${id}/${fileName}?${info.modificationTime}`;
          return path;
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
      const fullResizeOptions: ImageManipulator.ActionResize = {resize: {
        width: Math.min(1500, imageWidth),
        height: Math.min(1500, imageWidth),
      }};
      const smallResizeOptions: ImageManipulator.ActionResize = {resize: {
        width: Math.min(200, imageWidth),
        height: Math.min(200, imageWidth),
      }};
      // convert image to jpeg, save full size
      const fullConvert = await ImageManipulator.manipulateAsync(
        `${dir}/cover_temp.${extension}`,
        [...[fullResizeOptions]],
        { compress: 1, format: SaveFormat.JPEG, base64: true }
      );
      if (fullConvert.base64) {
        await FileSystem.writeAsStringAsync(`${dir}/cover_full.jpg`, fullConvert.base64, { encoding: 'base64' });
      }
      // convert image to jpeg, save small size
      const smallConvert = await ImageManipulator.manipulateAsync(
        `${dir}/cover_temp.${extension}`,
        [...[smallResizeOptions]],
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

export const getAlbumCoverPathFromSong = async (songId: number) => {
  const albums = await getAlbumsFromSong(songId);
  for (let i = 0; i < albums.length; i++) {
    const info = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}albums/${albums[i].id}`);
    if (info.exists) {
      const contents = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}albums/${albums[i].id}`);
      if (contents.includes('cover_full.jpg')) {
        return `${FileSystem.documentDirectory}albums/${albums[i].id}/cover_full.jpg?${info.modificationTime}`;
      }
    }
  }
  return null;
}
