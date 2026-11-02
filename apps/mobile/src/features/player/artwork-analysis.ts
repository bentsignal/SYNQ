// eslint-disable-next-line no-restricted-imports -- A native read of the cover, not the library; the previous song's result stays up until the next one's is ready.
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ArtworkRef } from "@synq/db";
import { artworkPath } from "@synq/db";
import { documentFile } from "@synq/db/expo";

import { queryClient } from "~/lib/query-client";
import { analyzeArtwork } from "./native-backdrop";

/** The cover's smallest file: a 2.5.2 cover may exist in only one size. */
export function coverFileUri(artwork: ArtworkRef) {
  const small = documentFile(artworkPath(artwork, "small"));
  return small.exists
    ? small.uri
    : documentFile(artworkPath(artwork, "full")).uri;
}

function analysisQuery(artwork: ArtworkRef | null) {
  return {
    gcTime: Infinity,
    queryFn: async () =>
      artwork === null || analyzeArtwork === null
        ? null
        : analyzeArtwork(coverFileUri(artwork)),
    queryKey: [
      "artwork-analysis",
      artwork?.kind,
      artwork?.id,
      artwork?.version,
    ],
    staleTime: Infinity,
  };
}

/** The cover's colors and corners, or no data in a build without the reader. */
export function useArtworkAnalysis(artwork: ArtworkRef | null) {
  return useQuery({
    ...analysisQuery(artwork),
    enabled: artwork !== null && analyzeArtwork !== null,
    placeholderData: keepPreviousData,
    select: (analysis) => analysis,
  });
}

/** Reads a cover ahead of time, so its song starts with its corners known. */
export function prefetchArtworkAnalysis(artwork: ArtworkRef) {
  if (analyzeArtwork === null) return;
  void queryClient.prefetchQuery(analysisQuery(artwork));
}
