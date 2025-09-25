import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { create } from "zustand";
import { digest } from "../lib/digest";
import { posthog } from "../lib/posthog";

type IngestState = "idle" | "browsing" | "transferring" | "processing";

const supportedFileTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/flac",
  "audio/aac",
];

interface IngestStore {
  ingestState: IngestState;
  numFilesToIngest: number;
  numFilesIngested: number;
  ingestFromFileBrowser: () => Promise<void>;
  reset: () => void;
}

export const useIngestStore = create<IngestStore>((set, get) => ({
  ingestState: "idle",
  numFilesToIngest: 0,
  numFilesIngested: 0,
  reset: () => {
    set({ ingestState: "idle", numFilesToIngest: 0, numFilesIngested: 0 });
  },
  ingestFromFileBrowser: async () => {
    set({ ingestState: "browsing" });
    posthog.capture("import_files");
    router.push("/ingest/from-file-browser");
    await new Promise((resolve) => setTimeout(resolve, 10));
    const results = await DocumentPicker.getDocumentAsync({
      type: supportedFileTypes,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (results.canceled || results.assets.length === 0) {
      get().reset();
      router.replace("/(tabs)");
      return;
    }
    set({ numFilesToIngest: results.assets.length, ingestState: "processing" });
    for (let i = 0; i < results.assets.length; i++) {
      set({ numFilesIngested: i });
      const asset = results.assets[i];
      await digest(asset);
    }
    get().reset();
  },
}));
