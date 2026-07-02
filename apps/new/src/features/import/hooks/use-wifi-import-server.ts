import * as Device from "expo-device";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import {
  BridgeServer,
  type Request,
  type Response,
} from "react-native-http-bridge-refurbished";
import { stageWifiImportFile } from "../services/import-file-service";
import {
  getWifiStartTransferDecision,
  getWifiUploadDecision,
  getWifiUploadFailureResponse,
  wifiImportFinishResponse,
  wifiImportPrepareFailureResponse,
  wifiImportResetResponse,
} from "../services/wifi-import-request-service";
import { getWifiTransferPage } from "../services/wifi-transfer-page";
import { useImportSession } from "./use-import-session";

const wifiImportPorts = [3000, 3001, 3002, 3003, 3004] as const;

type BridgeRequest = Request<unknown>;
type BridgeResponse = Response;

const sendJson = (
  response: BridgeResponse,
  payload: { message: string; status: number },
) => {
  response.json(payload, payload.status);
};

export function useWifiImportServer() {
  const {
    beginWifiTransfer,
    failSession,
    finishWifiTransfer,
    receiveWifiSong,
  } = useImportSession();
  const [error, setError] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const beginWifiTransferRef = useRef(beginWifiTransfer);
  const failSessionRef = useRef(failSession);
  const finishWifiTransferRef = useRef(finishWifiTransfer);
  const isMidTransferRef = useRef(false);
  const receiveWifiSongRef = useRef(receiveWifiSong);
  const receivedIdsRef = useRef(new Set<number>());

  useEffect(() => {
    beginWifiTransferRef.current = beginWifiTransfer;
    failSessionRef.current = failSession;
    finishWifiTransferRef.current = finishWifiTransfer;
    receiveWifiSongRef.current = receiveWifiSong;
  }, [beginWifiTransfer, failSession, finishWifiTransfer, receiveWifiSong]);

  useEffect(() => {
    let isMounted = true;

    const loadIpAddress = async () => {
      try {
        const nextAddress = await Network.getIpAddressAsync();
        if (isMounted) {
          setIpAddress(nextAddress);
        }
      } catch {
        if (isMounted) {
          setIpAddress("");
        }
      }
    };

    void loadIpAddress();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let activeServer: BridgeServer | null = null;

    const handleRoot = async (_request: BridgeRequest, response: BridgeResponse) => {
      response.html(getWifiTransferPage());
    };

    const handleReset = async (
      _request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      receivedIdsRef.current.clear();
      isMidTransferRef.current = false;
      sendJson(response, wifiImportResetResponse);
    };

    const handleConnection = async (
      _request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      response.json({
        deviceName: Device.deviceName ?? "SYNQ",
      }, 200);
    };

    const handleStartTransfer = async (
      request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      const decision = getWifiStartTransferDecision({
        isMidTransfer: isMidTransferRef.current,
        postData: request.postData,
      });

      if (!decision.shouldStart) {
        sendJson(response, decision.response);
        return;
      }

      receivedIdsRef.current.clear();
      const canStart = await beginWifiTransferRef.current(decision.transferSize);
      if (!canStart) {
        sendJson(response, wifiImportPrepareFailureResponse);
        return;
      }

      isMidTransferRef.current = true;
      sendJson(response, decision.response);
    };

    const handleFinishTransfer = async (
      _request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      isMidTransferRef.current = false;
      finishWifiTransferRef.current();
      sendJson(response, wifiImportFinishResponse);
    };

    const handleFileUpload = async (
      request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      try {
        const decision = getWifiUploadDecision({
          postData: request.postData,
          receivedIds: receivedIdsRef.current,
        });

        if (!decision.shouldAccept) {
          sendJson(response, decision.response);
          return;
        }

        const song = await stageWifiImportFile({
          data: decision.upload.b64,
          id: decision.upload.id,
          name: decision.upload.name,
          type: decision.upload.type,
        });

        receivedIdsRef.current.add(decision.upload.id);
        receiveWifiSongRef.current(song);
        sendJson(response, decision.response);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        failSessionRef.current(message);
        sendJson(response, getWifiUploadFailureResponse(message));
      }
    };

    const registerRoutes = (server: BridgeServer) => {
      server.get("/", handleRoot);
      server.get("/reset", handleReset);
      server.get("/checkConnection", handleConnection);
      server.post("/startTransfer", handleStartTransfer);
      server.post("/finishTransfer", handleFinishTransfer);
      server.post("/fileUpload", handleFileUpload);
    };

    try {
      for (const nextPort of wifiImportPorts) {
        const server = new BridgeServer("synq_import_service", true);

        try {
          server.listen(nextPort);
          registerRoutes(server);
          activeServer = server;
          setPort(nextPort);
          break;
        } catch {
          server.stop();
        }
      }

      if (!activeServer) {
        throw new Error(
          `Wi-Fi transfer server could not start on ports ${wifiImportPorts.join(", ")}.`,
        );
      }

      setError(null);
      setIsReady(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Wi-Fi transfer server could not start.",
      );
      setIsReady(false);
      setPort(null);
    }

    return () => {
      setIsReady(false);
      setPort(null);
      activeServer?.stop();
    };
  }, []);

  return {
    address: ipAddress && port ? `http://${ipAddress}:${port}` : "",
    error,
    isReady,
    port,
  };
}
