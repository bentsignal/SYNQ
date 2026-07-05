export type WifiImportServerState = {
  error: string | null;
  ipAddress: string;
  isReady: boolean;
  port: number | null;
};

export type WifiImportServerAction =
  | {
      ipAddress: string;
      type: "resolve-address";
    }
  | {
      type: "clear-address";
    }
  | {
      port: number;
      type: "start";
    }
  | {
      error: string;
      type: "fail";
    }
  | {
      type: "stop";
    };

export const initialWifiImportServerState: WifiImportServerState = {
  error: null,
  ipAddress: "",
  isReady: false,
  port: null,
};

export const getWifiImportServerStopAction = (): WifiImportServerAction => ({
  type: "stop",
});

export const wifiImportServerReducer = (
  state: WifiImportServerState,
  action: WifiImportServerAction,
): WifiImportServerState => {
  switch (action.type) {
    case "resolve-address":
      return {
        ...state,
        ipAddress: action.ipAddress,
      };
    case "clear-address":
      return {
        ...state,
        ipAddress: "",
      };
    case "start":
      return {
        ...state,
        error: null,
        isReady: true,
        port: action.port,
      };
    case "fail":
      return {
        ...state,
        error: action.error,
        isReady: false,
        port: null,
      };
    case "stop":
      return {
        ...state,
        isReady: false,
        port: null,
      };
  }
};
