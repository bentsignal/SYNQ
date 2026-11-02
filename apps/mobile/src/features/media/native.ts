import { requireOptionalNativeModule } from "expo";

/** What `readAudioFile` found: raw tag text, cleaned by `cleanTags`. */
export interface NativeAudioInfo {
  durationMs: number;
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  year?: string | null;
  track?: string | null;
  /** The embedded artwork was written to the given artwork URI. */
  hasArtwork: boolean;
}

export interface TransferEvents {
  onTransferStart: (event: {
    id: string;
    name: string;
    size: number;
    /** Newer than the event: older binaries leave it out. */
    mimeType?: string;
  }) => void;
  onTransferProgress: (event: {
    id: string;
    received: number;
    size: number;
  }) => void;
  onTransferFile: (event: {
    id: string;
    uri: string;
    name: string;
    mimeType: string;
    size: number;
  }) => void;
  onTransferFailed: (event: { id: string }) => void;
  onTransferStopped: (event: { reason: string }) => void;
  /** How many pages hold the live link. Only with `setTransferState`. */
  onTransferClients: (event: { count: number }) => void;
}

/** `modules/synq-media` (Swift). */
interface SynqMediaModule {
  readAudioFile: (
    fileUri: string,
    artworkUri: string,
  ) => Promise<NativeAudioInfo>;
  writeCovers: (imageUri: string, directoryUri: string) => Promise<void>;
  /** A cover's average top and bottom colors (`#rrggbb`), or none. */
  artworkColors?: (imageUri: string) => Promise<string[]>;
  spliceFile: (
    sourceUri: string,
    destinationUri: string,
    skip: number,
    head: Uint8Array,
  ) => Promise<void>;
  tagMp4: (
    sourceUri: string,
    destinationUri: string,
    tags: {
      title: string | null;
      artist: string | null;
      album: string | null;
      year: number | null;
      track: number | null;
    },
    artworkUri: string | null,
  ) => Promise<void>;
  linkTree: (fromUri: string, toUri: string) => Promise<void>;
  startTransferServer: (
    port: number,
    page: string,
    uploadDirectoryUri: string,
    extensions: string[],
  ) => Promise<number>;
  stopTransferServer: () => void;
  /**
   * What the page is told, and whether uploads are allowed. Older binaries
   * lack these three; their server takes uploads whenever it runs.
   */
  setTransferState?: (stateJson: string, accepting: boolean) => void;
  /** Whether the server's listener still answers. */
  checkTransferServer?: () => Promise<boolean>;
  copyText?: (text: string) => void;
  wifiAddress: () => string | null;
  addListener: <Name extends keyof TransferEvents>(
    name: Name,
    listener: TransferEvents[Name],
  ) => { remove: () => void };
}

// Optional, so a binary built before the module keeps running; the
// features that need it report themselves unavailable.
const native = requireOptionalNativeModule<SynqMediaModule>("SynqMedia");

/** The media module, or an error saying this build lacks it. */
export function synqMedia() {
  if (native === null) {
    throw new Error("This version of SYNQ can't read audio files.");
  }
  return native;
}

export function synqMediaAvailable() {
  return native !== null;
}
