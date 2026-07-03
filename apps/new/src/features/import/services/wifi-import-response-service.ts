export type WifiImportJsonResponse = {
  message: string;
  status: number;
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
