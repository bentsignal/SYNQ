import type { CollectionFormKind } from "./collection-form-domain-service";

export type CollectionDetailHref =
  | "/(tabs)/library"
  | `/(tabs)/library/album/${number}`
  | `/(tabs)/library/artist/${number}`
  | `/(tabs)/library/playlist/${number}`;

export const getCollectionFormBackHref = (): CollectionDetailHref =>
  "/(tabs)/library";

export const getCollectionFormBackLink = () => ({
  href: getCollectionFormBackHref(),
  label: "Back to Library",
});

export const getCollectionDetailHref = ({
  id,
  kind,
}: {
  id: number;
  kind: CollectionFormKind;
}): CollectionDetailHref => {
  switch (kind) {
    case "album":
      return `/(tabs)/library/album/${id}`;
    case "artist":
      return `/(tabs)/library/artist/${id}`;
    case "playlist":
      return `/(tabs)/library/playlist/${id}`;
  }
};
