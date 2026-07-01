type WifiUploadPostData = {
  data?: string;
  id?: number | string;
  name?: string;
  type?: string;
};

export type WifiUploadRequest = {
  b64: string;
  id: number;
  name: string;
  type: string;
};

const acceptedTypes = [
  "audio/mpeg",
  "audio/flac",
  "audio/wav",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
];

export function parseWifiUploadRequest(
  postData: WifiUploadPostData,
): WifiUploadRequest {
  return {
    name: postData.name ? postData.name : "",
    type: postData.type ? postData.type : "",
    b64: postData.data ? postData.data : "",
    id: postData.id ? Number(postData.id) : 0,
  };
}

export function isAcceptedWifiUpload({
  b64,
  name,
  type,
}: WifiUploadRequest) {
  return Boolean(name && acceptedTypes.includes(type) && b64);
}
