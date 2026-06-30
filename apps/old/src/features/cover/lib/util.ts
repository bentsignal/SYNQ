import * as FileSystem from "expo-file-system";

const coversDirectory = `${FileSystem.documentDirectory}covers/`;

export const getAbsoluteImagePath = async (id: string) => {
  const pathToFullImage = `${coversDirectory}${id}-full.jpg`;
  const pathToSmallImage = `${coversDirectory}${id}-small.jpg`;
  const [fullImageInfo, smallImageInfo] = await Promise.all([
    FileSystem.getInfoAsync(pathToFullImage),
    FileSystem.getInfoAsync(pathToSmallImage),
  ]);
  return {
    pathToFull: fullImageInfo.exists ? pathToFullImage : null,
    pathToSmall: smallImageInfo.exists ? pathToSmallImage : null,
  };
};

export const ensureCoverDirectoryExists = async () => {
  const info = await FileSystem.getInfoAsync(coversDirectory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(coversDirectory);
  }
};
