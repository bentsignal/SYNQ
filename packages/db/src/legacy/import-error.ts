export type LegacyImportErrorCode = "target-not-empty" | "verification-failed";

export class LegacyImportError extends Error {
  readonly code: LegacyImportErrorCode;

  constructor(code: LegacyImportErrorCode, message: string) {
    super(message);
    this.name = "LegacyImportError";
    this.code = code;
  }
}
