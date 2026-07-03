import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import {
  pickCollectionImageWithDependencies,
  supportedCollectionImageTypes,
  type CollectionImagePickerDependencies,
} from "./collection-image-picker-executor-service";

const collectionImagePickerDependencies: CollectionImagePickerDependencies = {
  pickImage: () =>
    DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: supportedCollectionImageTypes,
    }),
  readBase64File: (uri) =>
    FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    }),
};

export async function pickCollectionImage() {
  return pickCollectionImageWithDependencies(collectionImagePickerDependencies);
}
