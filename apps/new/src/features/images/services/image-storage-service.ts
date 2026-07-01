import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { SaveFormat } from "expo-image-manipulator";

const imageDirectory = `${FileSystem.documentDirectory}images`;

const splitImageData = (image: string) => {
  const [metadata, buffer] = image.split(",");
  const mime = metadata?.match(/^data:(.*);base64$/)?.[1] ?? "";

  return {
    buffer,
    mime,
  };
};

export const getImagePathFromHash = (hash: string) => ({
  pathToFullImage: `${imageDirectory}/${hash}-full.jpg`,
  pathToSmallImage: `${imageDirectory}/${hash}-small.jpg`,
});

const assertImageDirectoryExists = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory is unavailable.");
  }

  await FileSystem.makeDirectoryAsync(imageDirectory, {
    intermediates: true,
  });
};

const checkIfImageExists = async (hash: string) => {
  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);
  const [fullImageFile, smallImageFile] = await Promise.all([
    FileSystem.getInfoAsync(pathToFullImage),
    FileSystem.getInfoAsync(pathToSmallImage),
  ]);
  const existingRows = await db
    .select({ hash: schema.images.hash })
    .from(schema.images)
    .where(eq(schema.images.hash, hash))
    .limit(1);

  return fullImageFile.exists && smallImageFile.exists && existingRows.length > 0;
};

const writeImageVariant = async ({
  base64,
  path,
  width,
}: {
  base64: string;
  path: string;
  width: number;
}) => {
  const manipulated = await ImageManipulator.manipulateAsync(
    `data:image/jpeg;base64,${base64}`,
    [{ resize: { width } }],
    {
      base64: true,
      compress: width <= 200 ? 0.5 : 1,
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

const writeImageToFileSystem = async (base64Image: string, hash: string) => {
  const { buffer, mime } = splitImageData(base64Image);

  if (!buffer || (mime !== "image/jpeg" && mime !== "image/png")) {
    throw new Error(`Invalid image format: ${mime || "unknown"}`);
  }

  const { pathToFullImage, pathToSmallImage } = getImagePathFromHash(hash);

  await Promise.all([
    writeImageVariant({
      base64: buffer,
      path: pathToFullImage,
      width: 1500,
    }),
    writeImageVariant({
      base64: buffer,
      path: pathToSmallImage,
      width: 200,
    }),
  ]);
};

export async function saveCoverImage(base64Image?: string | null) {
  if (!base64Image) {
    return null;
  }

  await assertImageDirectoryExists();

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    base64Image.slice(0, 100),
  );

  if (await checkIfImageExists(hash)) {
    return hash;
  }

  await writeImageToFileSystem(base64Image, hash);
  await db.insert(schema.images).values({ hash });

  return hash;
}
