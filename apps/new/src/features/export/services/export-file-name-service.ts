export const sanitizeExportFileName = (value: string) =>
  value.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "song";

export const getExportFileNameFromPath = (path: string, fallback: string) => {
  const rawName = decodeURIComponent(
    path.split("/").filter(Boolean).at(-1) ?? "",
  );

  return sanitizeExportFileName(rawName || fallback);
};
