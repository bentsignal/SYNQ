import type { ViewProps } from "react-native";
import { requireNativeView, requireOptionalNativeModule } from "expo";

export interface FadeViewProps extends ViewProps {
  fadeWidth: number;
  /** Where the content is: 0 at its start, 1 moving, 2 at its end. */
  phase: number;
  /** Changes when the content does, so the view checks whether it still overflows. */
  contentKey: string;
}

/** `modules/synq-fade`, or null in a binary built before it, which clips. */
export const FadeView =
  requireOptionalNativeModule("SynqFade") === null
    ? null
    : requireNativeView<FadeViewProps>("SynqFade");
