import type { WifiImportJsonResponse } from "./wifi-import-response-service";

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

export const getWifiTransferSize = (postData: unknown) => {
  if (!postData || typeof postData !== "object") {
    return 0;
  }

  const size = (postData as { size?: unknown }).size;
  const value =
    typeof size === "number" || typeof size === "string" ? Number(size) : 0;

  return Number.isInteger(value) && value > 0 ? value : 0;
};

export const isWifiImportTransferPathname = (pathname: string) =>
  pathname === "/(tabs)/import/wifi" ||
  pathname === "/import/wifi" ||
  pathname === "/ingest/from-network";

export const getWifiStartTransferDecision = ({
  allowTransfer,
  isMidTransfer,
  postData,
}: {
  allowTransfer: boolean;
  isMidTransfer: boolean;
  postData: unknown;
}): WifiStartTransferDecision => {
  if (!allowTransfer) {
    return {
      response: {
        message: "Must be on Wifi Transfer page in app",
        status: 400,
      },
      shouldStart: false,
      transferSize: 0,
    };
  }

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
