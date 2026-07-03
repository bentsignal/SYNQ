import { getWifiImportServerStartErrorMessage } from "./wifi-import-response-service";
import type { WifiImportRouteRuntimeState } from "./wifi-import-route-runtime-state-service";
import type { WifiImportRouteHandlers } from "./wifi-import-route-handler-service";
import type { WifiImportServerAction } from "./wifi-import-server-state-service";

type WifiImportServerStopHandle = {
  stop: () => void;
};

export type WifiImportServerStartup = {
  port: number;
  server: WifiImportServerStopHandle;
};

export type WifiImportServerStartupResult = {
  action: WifiImportServerAction;
  server: WifiImportServerStopHandle | null;
};

export const resolveWifiImportServerAddressAction = async ({
  getIpAddress,
}: {
  getIpAddress: () => Promise<string>;
}): Promise<WifiImportServerAction> => {
  try {
    return {
      ipAddress: await getIpAddress(),
      type: "resolve-address",
    };
  } catch {
    return { type: "clear-address" };
  }
};

export const startWifiImportServerWithDependencies = <RouteDependencies>({
  createRouteHandlers,
  createRuntimeState,
  getRouteDependencies,
  startServer,
}: {
  createRouteHandlers: (params: {
    dependencies: () => RouteDependencies;
    runtimeState: WifiImportRouteRuntimeState;
  }) => WifiImportRouteHandlers;
  createRuntimeState: () => WifiImportRouteRuntimeState;
  getRouteDependencies: () => RouteDependencies;
  startServer: (params: {
    routeHandlers: WifiImportRouteHandlers;
  }) => WifiImportServerStartup;
}): WifiImportServerStartupResult => {
  const routeHandlers = createRouteHandlers({
    dependencies: getRouteDependencies,
    runtimeState: createRuntimeState(),
  });

  try {
    const { port, server } = startServer({ routeHandlers });

    return {
      action: {
        port,
        type: "start",
      },
      server,
    };
  } catch (caughtError) {
    return {
      action: {
        error: getWifiImportServerStartErrorMessage(caughtError),
        type: "fail",
      },
      server: null,
    };
  }
};
