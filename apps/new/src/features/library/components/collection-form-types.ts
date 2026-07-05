import type { CollectionFormActionState } from "../services/collection-form-interaction-service";
import type { CollectionFormKind } from "../services/collection-form-domain-service";
import type { getCollectionFormBackLink } from "../services/collection-form-navigation-service";

export type { CollectionFormKind } from "../services/collection-form-domain-service";

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
  artistNames?: string;
  backLink: ReturnType<typeof getCollectionFormBackLink>;
  copy: CollectionFormCopy;
  errorMessages?: (string | false | null | undefined)[];
  image: CollectionFormImage;
  imageFallbackName?: string | null;
  imageFallbackUri?: string | null;
  imageInitial: string;
  isSaving: boolean;
  kind: CollectionFormKind;
  name: string;
  onChangeArtistNames?: (artistNames: string) => void;
  onChangeName: (name: string) => void;
  onChangeYear: (year: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  saveLabel: string;
  subtitle: string;
  year: string;
};
