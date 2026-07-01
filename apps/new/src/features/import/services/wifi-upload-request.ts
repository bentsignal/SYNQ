type WifiUploadPostData = {
  data?: unknown;
  id?: unknown;
  name?: unknown;
  type?: unknown;
};

export type WifiUploadRequest = {
  b64: string;
  id: number;
  name: string;
  type: string;
};

const acceptedTypes = new Set([
  "audio/mpeg",
  "audio/flac",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
]);

export function parseWifiUploadRequest(postData: unknown): WifiUploadRequest {
  const data =
    postData && typeof postData === "object"
      ? (postData as WifiUploadPostData)
      : {};
  const id = typeof data.id === "string" || typeof data.id === "number"
    ? Number(data.id)
    : 0;

  return {
    b64: typeof data.data === "string" ? data.data : "",
    id: Number.isFinite(id) ? id : 0,
    name: typeof data.name === "string" ? data.name : "",
    type: typeof data.type === "string" ? data.type : "",
  };
}

export function isAcceptedWifiUpload({
  b64,
  id,
  name,
  type,
}: WifiUploadRequest) {
  return Boolean(id > 0 && name && acceptedTypes.has(type) && b64);
}
