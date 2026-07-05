import type {
  ImageStorageVariant,
} from "./image-storage-step-service";

export type ImageStorageDependencies = {
  createDirectory: (
    path: string,
    options: { intermediates: true },
  ) => Promise<void>;
  digestImageSample: (sample: string) => Promise<string>;
  getInfo: (path: string) => Promise<{ exists: boolean }>;
  hasStoredImageHash: (hash: string) => Promise<boolean>;
  imageDirectory: string | null;
  insertStoredImageHash: (hash: string) => Promise<void>;
  writeImageVariant: (variant: ImageStorageVariant) => Promise<void>;
};
