import type { CollectionFormActionState } from "../services/collection-form-service";

export type CollectionFormKind = "album" | "artist" | "playlist";

export type CollectionFormCopy = {
  kicker: string;
  namePlaceholder: string;
  title: string;
};

export type CollectionFormImage = {
  dataUrl: string;
  fileName: string;
} | null;

export type CollectionFormViewProps = {
  actionState: CollectionFormActionState;
  copy: CollectionFormCopy;
  errorMessages?: (string | false | null | undefined)[];
  image: CollectionFormImage;
  imageFallbackName?: string | null;
  imageFallbackUri?: string | null;
  imageInitial: string;
  isSaving: boolean;
  kind: CollectionFormKind;
  name: string;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  subtitle: string;
  year: string;
};
