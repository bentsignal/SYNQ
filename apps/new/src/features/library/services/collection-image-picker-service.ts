import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const supportedImageTypes = ["image/jpeg", "image/png"];

export async function pickCollectionImage() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: supportedImageTypes,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  const mimeType = asset.mimeType ?? "image/jpeg";
  if (!supportedImageTypes.includes(mimeType)) {
    throw new Error("Choose a JPEG or PNG image.");
  }

  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    fileName: asset.name,
  };
}
