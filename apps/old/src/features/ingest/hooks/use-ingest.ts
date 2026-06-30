import { Cause, Effect, pipe } from "effect";
import { router } from "expo-router";
import { create } from "zustand";
import { posthog } from "@/src/lib/posthog";
import { selectFiles } from "../lib/file-picker";
import { createIngestedSongFromAsset } from "../repository/ingest-song-repository";

type IngestState = "idle" | "browsing" | "transferring" | "processing";

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
    const ingest = pipe(
      selectFiles,
      Effect.tap((assets) =>
        Effect.sync(() =>
          set({
            ingestState: "processing",
            numFilesToIngest: assets.length,
            numFilesIngested: 0,
          }),
        ),
      ),
      Effect.flatMap((assets) =>
        Effect.forEach(
          assets,
          (asset, index) =>
            pipe(
              Effect.promise(() => createIngestedSongFromAsset(asset)),
              Effect.tap(() =>
                Effect.sync(() => set({ numFilesIngested: index + 1 })),
              ),
            ),
          { concurrency: 1 },
        ),
      ),
      Effect.tap(() => Effect.sync(() => router.replace("/ingest/success"))),
      Effect.catchTags({
        FileSelectionCanceled: (_FileSelectionCanceled) => {
          router.replace("/(tabs)");
          return Effect.succeed(0);
        },
        NoFilesSelected: (_NoFilesSelected) => {
          router.replace("/(tabs)");
          return Effect.succeed(0);
        },
      }),
      Effect.catchAllCause((cause) => {
        router.replace("/ingest/failure");
        console.error("error ingesting files: ", Cause.pretty(cause));
        return Effect.succeed(0);
      }),
      Effect.withLogSpan("ingest-file-browser"),
    );
    Effect.runPromise(ingest).then(() => get().reset());
  },
}));
