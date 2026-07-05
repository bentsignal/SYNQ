import {
  getWifiImportServerStopAction,
  type WifiImportServerAction,
} from "./wifi-import-server-state-service";
import {
  resolveWifiImportServerAddressAction,
  startWifiImportServerWithDependencies,
  type WifiImportServerStartup,
} from "./wifi-import-server-command-service";
import type { WifiImportRouteRuntimeState } from "./wifi-import-route-runtime-state-service";
import type { WifiImportRouteHandlers } from "./wifi-import-route-handler-service";

type WifiImportServerDispatch = (action: WifiImportServerAction) => void;

type WifiImportServerAddressLoadParams = {
  dispatch: WifiImportServerDispatch;
  getIpAddress: () => Promise<string>;
  isActive: () => boolean;
};

export const runWifiImportServerAddressLoadCommand = async ({
  dispatch,
  getIpAddress,
  isActive,
}: WifiImportServerAddressLoadParams) => {
  const action = await resolveWifiImportServerAddressAction({ getIpAddress });

  if (isActive()) {
    dispatch(action);
  }
};

export const runWifiImportServerStartupCommand = <RouteDependencies>({
  createRouteHandlers,
  createRuntimeState,
  dispatch,
  getRouteDependencies,
  startServer,
}: {
  createRouteHandlers: (params: {
    dependencies: () => RouteDependencies;
    runtimeState: WifiImportRouteRuntimeState;
  }) => WifiImportRouteHandlers;
  createRuntimeState: () => WifiImportRouteRuntimeState;
  dispatch: WifiImportServerDispatch;
  getRouteDependencies: () => RouteDependencies;
  startServer: (params: {
    routeHandlers: WifiImportRouteHandlers;
  }) => WifiImportServerStartup;
}) => {
  const startup = startWifiImportServerWithDependencies({
    createRouteHandlers,
    createRuntimeState,
    getRouteDependencies,
    startServer,
  });
  dispatch(startup.action);

  return () => {
    dispatch(getWifiImportServerStopAction());
    startup.server?.stop();
  };
};
