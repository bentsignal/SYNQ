import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import { SaveFormat } from "expo-image-manipulator";
import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";
import { db } from "../db";
import { images } from "../db/schema";

const imageDirectory = `${FileSystem.documentDirectory}images`;

export const saveCoverImage = async (base64image?: string) => {
  if (!base64image) return null;
  await assertImageDirectoryExists();
  const numberOfCharactersToUse = 100;
  const hashFunctionInput =
    base64image.length > numberOfCharactersToUse
      ? base64image.slice(0, numberOfCharactersToUse)
      : base64image;

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hashFunctionInput,
  );
  const imageAlreadyIngested = await checkIfImageExists(hash);
  if (imageAlreadyIngested) {
    return hash;
  }
  await writeImageToFileSystem(base64image, hash);
  await db.insert(images).values({ hash });
  return hash;
};

export const checkIfImageExists = async (hash: string) => {
  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);
  const [fullImageFile, smallImageFile] = await Promise.all([
    FileSystem.getInfoAsync(pathToFullImage),
    FileSystem.getInfoAsync(pathToSmallImage),
  ]);
  const existsInDB = await db
    .select()
    .from(images)
    .where(eq(images.hash, hash));
  return fullImageFile.exists && smallImageFile.exists && existsInDB.length > 0;
};

export const writeImageToFileSystem = async (
  base64image: string,
  hash: string,
) => {
  // get image file type
  const infoString = base64image.split(/,(.*)/s)[0];
  const mimeTypeFull = infoString.split(/;(.*)/s)[0];
  const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
  const buffer = base64image.split(",")[1];
  let extension = "";
  if (mimeType === "image/jpeg") {
    extension = "jpg";
  } else if (mimeType === "image/png") {
    extension = "png";
  }
  if (extension === "") {
    throw new Error("Invalid image format: " + mimeType);
  }
  const tempPath = `${imageDirectory}/${hash}-temp.${extension}`;
  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);
  // write image as is
  await FileSystem.writeAsStringAsync(tempPath, buffer, { encoding: "base64" });
  // Get full size image dimensions
  const { width: imageSize } = await new Promise<{
    width: number;
  }>((resolve, reject) => {
    Image.getSize(tempPath, (width) => resolve({ width }), reject);
  });
  const fullResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(1500, imageSize),
      height: Math.min(1500, imageSize),
    },
  };
  const smallResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(200, imageSize),
      height: Math.min(200, imageSize),
    },
  };
  // convert image to jpeg, save full size
  const fullConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [...[fullResizeOptions]],
    { compress: 1, format: SaveFormat.JPEG, base64: true },
  );
  if (fullConvert.base64) {
    await FileSystem.writeAsStringAsync(pathToFullImage, fullConvert.base64, {
      encoding: "base64",
    });
  }
  // convert image to jpeg, save small size
  const smallConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [...[smallResizeOptions]],
    { compress: 0.5, format: SaveFormat.JPEG, base64: true },
  );
  if (smallConvert.base64) {
    await FileSystem.writeAsStringAsync(pathToSmallImage, smallConvert.base64, {
      encoding: "base64",
    });
  }
  // delete temp image
  await FileSystem.deleteAsync(tempPath);
};

export const getImagePathFromHash = (hash: string) => {
  return {
    pathToFullImage: `${imageDirectory}/${hash}-full.jpg`,
    pathToSmallImage: `${imageDirectory}/${hash}-small.jpg`,
  };
};

export const assertImageDirectoryExists = async () => {
  const directoryPath = FileSystem.documentDirectory + "images";
  const info = await FileSystem.getInfoAsync(directoryPath);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directoryPath, {
      intermediates: true,
    });
  }
};
