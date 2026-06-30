import { db } from "@synq/db";
import { images } from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

const imageDirectory = `${FileSystem.documentDirectory}images`;

export const splitImageMimeAndBuffer = (image: string) => {
  const infoString = image.split(/,(.*)/s)[0];
  const mimeTypeFull = infoString.split(/;(.*)/s)[0];
  const mimeType = mimeTypeFull.split(/:(.*)/s)[1];
  const bufferString = image.split(/,(.*)/s)[1];
  return {
    mime: mimeType,
    buffer: bufferString,
  };
};

export const pickCoverImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    selectionLimit: 1,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.3,
  });

  const image = result.assets?.[0];
  if (
    !result.canceled &&
    image?.base64 &&
    image.mimeType &&
    (image.mimeType === "image/jpeg" || image.mimeType === "image/png")
  ) {
    return `data:${image.mimeType};base64,${image.base64}`;
  }

  return "";
};

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
  await FileSystem.writeAsStringAsync(tempPath, buffer, { encoding: "base64" });
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
  await FileSystem.deleteAsync(tempPath);
};

export const writeCoverImageToDirectory = async (
  base64image: string,
  directory: string,
) => {
  if (!base64image) {
    return;
  }

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

  const directoryInfo = await FileSystem.getInfoAsync(directory);
  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });
  }

  const tempPath = `${directory}/cover_temp.${extension}`;
  await FileSystem.writeAsStringAsync(tempPath, buffer, { encoding: "base64" });

  const { width: imageWidth } = await new Promise<{ width: number }>(
    (resolve, reject) => {
      Image.getSize(tempPath, (width) => resolve({ width }), reject);
    },
  );
  const fullResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(1500, imageWidth),
      height: Math.min(1500, imageWidth),
    },
  };
  const smallResizeOptions: ImageManipulator.ActionResize = {
    resize: {
      width: Math.min(200, imageWidth),
      height: Math.min(200, imageWidth),
    },
  };

  const fullConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [fullResizeOptions],
    { compress: 1, format: SaveFormat.JPEG, base64: true },
  );
  if (fullConvert.base64) {
    await FileSystem.writeAsStringAsync(
      `${directory}/cover_full.jpg`,
      fullConvert.base64,
      { encoding: "base64" },
    );
  }

  const smallConvert = await ImageManipulator.manipulateAsync(
    tempPath,
    [smallResizeOptions],
    { compress: 0.5, format: SaveFormat.JPEG, base64: true },
  );
  if (smallConvert.base64) {
    await FileSystem.writeAsStringAsync(
      `${directory}/cover_small.jpg`,
      smallConvert.base64,
      { encoding: "base64" },
    );
  }

  await FileSystem.deleteAsync(tempPath);
};

export const writeImageToLibrary = writeCoverImageToDirectory;

export const getSongCover = async (id: number, full = false) => {
  try {
    const dir = `${FileSystem.documentDirectory}library/${id}`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      return undefined;
    }

    const contents = await FileSystem.readDirectoryAsync(dir);
    const fileName = full ? "cover_full.jpg" : "cover_small.jpg";
    if (contents.includes(fileName)) {
      return `${dir}/${fileName}?${info.modificationTime}`;
    }
  } catch (error) {
    const trace = error instanceof Error ? error.message : String(error);
    if (!(trace.includes("folder") && trace.includes("doesn't exist"))) {
      console.log("error getting cover image: ", error);
    }
  }
};

export const deleteImagesFromDirectory = async (dir: string) => {
  try {
    const contents = await FileSystem.readDirectoryAsync(dir);
    if (contents.includes("cover_full.jpg")) {
      await FileSystem.deleteAsync(`${dir}/cover_full.jpg`);
    }
    if (contents.includes("cover_small.jpg")) {
      await FileSystem.deleteAsync(`${dir}/cover_small.jpg`);
    }
  } catch (error) {
    console.log("error deleting images from directory: ", error);
  }
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
