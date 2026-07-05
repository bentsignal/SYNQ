import type { ImportNavigationHref } from "./import-navigation-service";

export type ImportResultViewState = {
  backHref: ImportNavigationHref;
  backLabel: string;
  kicker: string;
  panelHint?: string;
  panelLabel: string;
  panelText: string;
  subtitle: string;
  title: string;
  tone: "accent" | "danger";
};
