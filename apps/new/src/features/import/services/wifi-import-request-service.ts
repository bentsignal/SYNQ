import {
  isAcceptedWifiUpload,
  parseWifiUploadRequest,
  type WifiUploadRequest,
} from "./wifi-upload-request";

export type WifiImportJsonResponse = {
  message: string;
  status: number;
};

export type WifiStartTransferDecision =
  | {
      response: WifiImportJsonResponse;
      shouldStart: false;
      transferSize: 0;
    }
  | {
      response: WifiImportJsonResponse;
      shouldStart: true;
      transferSize: number;
    };

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

export const getWifiTransferSize = (postData: unknown) => {
  if (!postData || typeof postData !== "object") {
    return 0;
  }

  const size = (postData as { size?: unknown }).size;
  const value =
    typeof size === "number" || typeof size === "string" ? Number(size) : 0;

  return Number.isInteger(value) && value > 0 ? value : 0;
};

export const getWifiStartTransferDecision = ({
  isMidTransfer,
  postData,
}: {
  isMidTransfer: boolean;
  postData: unknown;
}): WifiStartTransferDecision => {
  if (isMidTransfer) {
    return {
      response: {
        message: "Transfer already in progress",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    };
  }

  const transferSize = getWifiTransferSize(postData);

  if (transferSize <= 0) {
    return {
      response: {
        message: "No data to transfer",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    };
  }

  return {
    response: {
      message: "OK - READY TO TRANSFER",
      status: 200,
    },
    shouldStart: true,
    transferSize,
  };
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

export const wifiImportResetResponse: WifiImportJsonResponse = {
  message: "OK - RESET RESULTS",
  status: 200,
};

export const wifiImportFinishResponse: WifiImportJsonResponse = {
  message: "OK - FINISHED TRANSFER",
  status: 200,
};

export const wifiImportPrepareFailureResponse: WifiImportJsonResponse = {
  message: "Failed to prepare import cache",
  status: 500,
};

export const getWifiImportServerStartErrorMessage = (caughtError: unknown) =>
  caughtError instanceof Error
    ? caughtError.message
    : "Wi-Fi transfer server could not start.";

export const getWifiUploadFailureResponse = (
  message: string,
): WifiImportJsonResponse => ({
  message: `ERROR - Failed to upload song: ${message}`,
  status: 500,
});
