import type { ViewProps } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

import type { ArtworkCluster, BackdropSwatch } from "./backdrop-palette";

export interface ArtworkAnalysis {
  clusters: ArtworkCluster[];
  /** How far in the art's own rounded corners start, as a share of its side. */
  cornerInset: number;
}

/** `modules/synq-backdrop` (Swift). */
interface SynqBackdropModule {
  /** Null for an unreadable image. */
  analyzeArtwork: (imageUri: string) => Promise<ArtworkAnalysis | null>;
}

export interface BackdropViewProps extends ViewProps {
  swatches: BackdropSwatch[];
  /** False holds the field still. */
  animating: boolean;
}

const native = requireOptionalNativeModule<SynqBackdropModule>("SynqBackdrop");

/** Null in a binary built before the module. */
export const analyzeArtwork =
  native === null ? null : (uri: string) => native.analyzeArtwork(uri);

/** Null in a binary built before the module, which keeps the gradient. */
export const BackdropView =
  native === null ? null : requireNativeView<BackdropViewProps>("SynqBackdrop");
