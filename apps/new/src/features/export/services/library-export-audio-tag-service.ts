import type { AudioMetadataTags } from "@synq/audio";
import type { LibraryExportArtworkTag } from "./library-export-artwork-service";
import type { LibraryExportMetadata } from "./library-export-metadata-builder-service";

export const buildLibraryExportAudioTags = ({
  artwork,
  metadata,
}: {
  artwork: LibraryExportArtworkTag | null;
  metadata: LibraryExportMetadata;
}): AudioMetadataTags => ({
  ...(artwork ? { APIC: artwork } : {}),
  album: metadata.album,
  artist: metadata.artist,
  title: metadata.title,
});
