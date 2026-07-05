import type { ImportFileCommands } from "./import-file-command-controller-service";
import type { ImportSessionBasicCommands } from "./import-session-basic-command-service";
import type { ImportSessionLifecycleCommands } from "./import-session-lifecycle-command-service";
import type { ImportSessionWifiCommands } from "./import-session-wifi-command-service";

type CreateImportSessionCommandsParams = {
  basicCommands: ImportSessionBasicCommands;
  fileCommands: ImportFileCommands;
  lifecycleCommands: ImportSessionLifecycleCommands;
  wifiCommands: ImportSessionWifiCommands;
};

export type ImportSessionCommands = ImportSessionBasicCommands &
  ImportFileCommands &
  ImportSessionLifecycleCommands &
  ImportSessionWifiCommands;

export const createImportSessionCommands = ({
  basicCommands,
  fileCommands,
  lifecycleCommands,
  wifiCommands,
}: CreateImportSessionCommandsParams): ImportSessionCommands => ({
  ...basicCommands,
  ...fileCommands,
  ...lifecycleCommands,
  ...wifiCommands,
});
