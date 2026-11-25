import { Alert } from "react-native";
import { Directory, Paths } from "expo-file-system";

import type { ImportSource } from "./pipeline";
import { synqMedia } from "~/features/media/native";
import { addImportSources } from "./session";

/**
 * Where picked videos are copied on their way to the import queue, which
 * deletes each once its sound is in the library.
 */
const STAGING = new Directory(Paths.cache, "video-import");

/** The picker is up; a second tap can't open another. */
let picking = false;

async function pickVideos() {
  const pick = synqMedia().pickVideos;
  if (pick === undefined) return [];
  const videos = await pick(STAGING.uri);
  // Unique across picks, and across launches.
  const batch = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return videos.map(
    (video, index): ImportSource => ({
      key: `photos-${batch}-${String(index)}`,
      mimeType: null,
      name: video.name,
      uri: video.uri,
    }),
  );
}

/**
 * Import from Video: the photo picker comes up right away, showing videos,
 * and the sound of each one picked imports in the background.
 */
export function importFromVideo() {
  if (picking) return;
  picking = true;
  pickVideos().then(
    (sources) => {
      picking = false;
      addImportSources(sources);
    },
    () => {
      picking = false;
      Alert.alert("Couldn't Open Photos", "Try again.");
    },
  );
}
