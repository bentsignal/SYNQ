export type WifiImportRouteRuntimeState = {
  isMidTransfer: boolean;
  receivedIds: Set<number>;
};

export const createWifiImportRouteRuntimeState =
  (): WifiImportRouteRuntimeState => ({
    isMidTransfer: false,
    receivedIds: new Set<number>(),
  });
