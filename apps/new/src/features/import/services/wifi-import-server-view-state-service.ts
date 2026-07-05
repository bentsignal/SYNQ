import type { WifiImportServerState } from "./wifi-import-server-state-service";

export const getWifiImportServerAddress = ({
  ipAddress,
  port,
}: Pick<WifiImportServerState, "ipAddress" | "port">) =>
  ipAddress && port ? `http://${ipAddress}:${port}` : "";
