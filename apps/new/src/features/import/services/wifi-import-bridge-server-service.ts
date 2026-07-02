import { BridgeServer } from "react-native-http-bridge-refurbished";
import type { WifiImportRouteHandlers } from "./wifi-import-server-route-service";

export const wifiImportPorts = [3000, 3001, 3002, 3003, 3004] as const;

export type WifiImportBridgeServerStartup = {
  port: number;
  server: BridgeServer;
};

type WifiImportBridgeServerFactory = () => BridgeServer;

const createWifiImportBridgeServer: WifiImportBridgeServerFactory = () =>
  new BridgeServer("synq_import_service", true);

export const registerWifiImportRoutes = (
  server: BridgeServer,
  routeHandlers: WifiImportRouteHandlers,
) => {
  server.get("/", routeHandlers.handleRoot);
  server.get("/reset", routeHandlers.handleReset);
  server.get("/checkConnection", routeHandlers.handleConnection);
  server.post("/startTransfer", routeHandlers.handleStartTransfer);
  server.post("/finishTransfer", routeHandlers.handleFinishTransfer);
  server.post("/fileUpload", routeHandlers.handleFileUpload);
};

export const startWifiImportBridgeServer = ({
  createServer = createWifiImportBridgeServer,
  ports = wifiImportPorts,
  routeHandlers,
}: {
  createServer?: WifiImportBridgeServerFactory;
  ports?: readonly number[];
  routeHandlers: WifiImportRouteHandlers;
}): WifiImportBridgeServerStartup => {
  for (const nextPort of ports) {
    const server = createServer();

    try {
      server.listen(nextPort);
      registerWifiImportRoutes(server, routeHandlers);

      return {
        port: nextPort,
        server,
      };
    } catch {
      server.stop();
    }
  }

  throw new Error(
    `Wi-Fi transfer server could not start on ports ${ports.join(", ")}.`,
  );
};
