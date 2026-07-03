import type { WifiImportJsonResponse } from "./wifi-import-response-service";
import {
  isAcceptedWifiUpload,
  parseWifiUploadRequest,
  type WifiUploadRequest,
} from "./wifi-upload-request";

export type WifiUploadDecision =
  | {
      response: WifiImportJsonResponse;
      shouldAccept: false;
      upload: WifiUploadRequest;
    }
  | {
      response: WifiImportJsonResponse;
      shouldAccept: true;
      upload: WifiUploadRequest;
    };

export const getWifiUploadDecision = ({
  postData,
  receivedIds,
}: {
  postData: unknown;
  receivedIds: Set<number>;
}): WifiUploadDecision => {
  const upload = parseWifiUploadRequest(postData);

  if (!isAcceptedWifiUpload(upload) || receivedIds.has(upload.id)) {
    return {
      response: {
        message: `ERROR - Bad data from ${upload.name || "upload"}`,
        status: 409,
      },
      shouldAccept: false,
      upload,
    };
  }

  return {
    response: {
      message: `OK - ${upload.name} RECEIVED`,
      status: 200,
    },
    shouldAccept: true,
    upload,
  };
};
