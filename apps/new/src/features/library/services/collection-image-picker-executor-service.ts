import type { CollectionFormImage } from "./collection-form-state-service";

export type CollectionImagePickerAsset = {
  mimeType?: string | null;
  name: string;
  uri: string;
};

export type CollectionImagePickerResult =
  | {
      assets: CollectionImagePickerAsset[];
      canceled: false;
    }
  | {
      assets?: CollectionImagePickerAsset[] | null;
      canceled: true;
    };

export type CollectionImagePickerDependencies = {
  pickImage: () => Promise<CollectionImagePickerResult>;
  readBase64File: (uri: string) => Promise<string>;
};

export const supportedCollectionImageTypes = ["image/jpeg", "image/png"];

export const getCollectionImageMimeType = (
  asset: CollectionImagePickerAsset,
) => asset.mimeType ?? "image/jpeg";

export const assertSupportedCollectionImageType = (mimeType: string) => {
  if (!supportedCollectionImageTypes.includes(mimeType)) {
    throw new Error("Choose a JPEG or PNG image.");
  }
};

export async function pickCollectionImageWithDependencies(
  dependencies: CollectionImagePickerDependencies,
): Promise<CollectionFormImage | null> {
  const result = await dependencies.pickImage();

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  const mimeType = getCollectionImageMimeType(asset);
  assertSupportedCollectionImageType(mimeType);

  const base64 = await dependencies.readBase64File(asset.uri);

  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    fileName: asset.name,
  };
}
