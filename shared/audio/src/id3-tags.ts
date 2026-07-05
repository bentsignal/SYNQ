import * as FileSystem from "expo-file-system/legacy";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import { writeExpo, type NodeId3Tags } from "./vendor/node-id3";

export type AudioMetadataTags = NodeId3Tags;

const writableId3FileTypes = new Set(["audio/mpeg", "audio/flac"]);

export async function writeId3TagsToAudioFile({
  filePath,
  fileType,
  tags,
}: {
  filePath: string;
  fileType: string | null | undefined;
  tags: AudioMetadataTags;
}) {
  if (!fileType || !writableId3FileTypes.has(fileType)) {
    return false;
  }

  const audioData = await FileSystem.readAsStringAsync(filePath, {
    encoding: "base64",
  });
  const taggedAudioData = fromByteArray(writeExpo(toByteArray(audioData), tags));

  await FileSystem.writeAsStringAsync(filePath, taggedAudioData, {
    encoding: "base64",
  });

  return true;
}
