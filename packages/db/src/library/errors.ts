export type LibraryErrorCode =
  | "not-found"
  | "empty-name"
  | "duplicate-name"
  | "liked-playlist";

/** A write the UI should explain to the user (as opposed to a bug). */
export class LibraryError extends Error {
  readonly code: LibraryErrorCode;

  constructor(code: LibraryErrorCode, message: string) {
    super(message);
    this.name = "LibraryError";
    this.code = code;
  }
}
