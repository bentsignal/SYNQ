import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";
import {
  hasStoredImageHash,
  insertStoredImageHash,
} from "../repository/image-repository";
import {
  getImagePathFromDirectory,
  saveCoverImageWithDependencies,
  type ImageStorageDependencies,
  type ImageStorageVariant,
} from "./image-storage-executor-service";

const imageDirectory = `${FileSystem.documentDirectory}images`;

const writeImageVariant = async ({
  base64,
  compress,
  path,
  width,
}: ImageStorageVariant) => {
  const manipulated = await ImageManipulator.manipulateAsync(
    `data:image/jpeg;base64,${base64}`,
    [{ resize: { width } }],
    {
      base64: true,
      compress,
      format: SaveFormat.JPEG,
    },
  );

  if (!manipulated.base64) {
    throw new Error("Image conversion failed.");
  }

  await FileSystem.writeAsStringAsync(path, manipulated.base64, {
    encoding: "base64",
  });
};

const imageStorageDependencies: ImageStorageDependencies = {
  createDirectory: FileSystem.makeDirectoryAsync,
  digestImageSample: (sample) =>
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, sample),
  getInfo: FileSystem.getInfoAsync,
  hasStoredImageHash,
  imageDirectory,
  insertStoredImageHash,
  writeImageVariant,
};

export const getImagePathFromHash = (hash: string) =>
  getImagePathFromDirectory({
    hash,
    imageDirectory,
  });

export async function saveCoverImage(base64Image?: string | null) {
  return saveCoverImageWithDependencies(base64Image, imageStorageDependencies);
}
