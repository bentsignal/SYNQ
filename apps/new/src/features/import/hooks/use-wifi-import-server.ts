import * as Device from "expo-device";
import * as Network from "expo-network";
import { useEffect, useRef, useState } from "react";
import {
  BridgeServer,
  type Request,
  type Response,
} from "react-native-http-bridge-refurbished";
import { stageWifiImportFile } from "../services/import-file-service";
import { getWifiTransferPage } from "../services/wifi-transfer-page";
import {
  isAcceptedWifiUpload,
  parseWifiUploadRequest,
} from "../services/wifi-upload-request";
import { useImportSession } from "./use-import-session";

const wifiImportPort = 3000;

const getTransferSize = (postData: unknown) => {
  if (!postData || typeof postData !== "object") {
    return 0;
  }

  const size = (postData as { size?: unknown }).size;
  const value = typeof size === "number" || typeof size === "string"
    ? Number(size)
    : 0;

  return Number.isInteger(value) && value > 0 ? value : 0;
};

type BridgeRequest = Request<unknown>;
type BridgeResponse = Response;

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
    const server = new BridgeServer("synq_import_service", true);

    const handleRoot = async (_request: BridgeRequest, response: BridgeResponse) => {
      response.html(getWifiTransferPage());
    };

    const handleReset = async (
      _request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      receivedIdsRef.current.clear();
      isMidTransferRef.current = false;
      response.json({
        message: "OK - RESET RESULTS",
        status: 200,
      }, 200);
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
      if (isMidTransferRef.current) {
        response.json({
          message: "Transfer already in progress",
          status: 400,
        }, 400);
        return;
      }

      const transferSize = getTransferSize(request.postData);
      if (transferSize <= 0) {
        response.json({
          message: "No data to transfer",
          status: 400,
        }, 400);
        return;
      }

      receivedIdsRef.current.clear();
      const canStart = await beginWifiTransferRef.current(transferSize);
      if (!canStart) {
        response.json({
          message: "Failed to prepare import cache",
          status: 500,
        }, 500);
        return;
      }

      isMidTransferRef.current = true;
      response.json({
        message: "OK - READY TO TRANSFER",
        status: 200,
      }, 200);
    };

    const handleFinishTransfer = async (
      _request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      isMidTransferRef.current = false;
      finishWifiTransferRef.current();
      response.json({
        message: "OK - FINISHED TRANSFER",
        status: 200,
      }, 200);
    };

    const handleFileUpload = async (
      request: BridgeRequest,
      response: BridgeResponse,
    ) => {
      try {
        const upload = parseWifiUploadRequest(request.postData);

        if (
          !isAcceptedWifiUpload(upload) ||
          receivedIdsRef.current.has(upload.id)
        ) {
          response.json({
            message: `ERROR - Bad data from ${upload.name || "upload"}`,
            status: 409,
          }, 409);
          return;
        }

        const song = await stageWifiImportFile({
          data: upload.b64,
          id: upload.id,
          name: upload.name,
          type: upload.type,
        });

        receivedIdsRef.current.add(upload.id);
        receiveWifiSongRef.current(song);
        response.json({
          message: `OK - ${upload.name} RECEIVED`,
          status: 200,
        }, 200);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        failSessionRef.current(message);
        response.json({
          message: `ERROR - Failed to upload song: ${message}`,
          status: 500,
        }, 500);
      }
    };

    try {
      server.listen(wifiImportPort);
      server.get("/", handleRoot);
      server.get("/reset", handleReset);
      server.get("/checkConnection", handleConnection);
      server.post("/startTransfer", handleStartTransfer);
      server.post("/finishTransfer", handleFinishTransfer);
      server.post("/fileUpload", handleFileUpload);
      setError(null);
      setIsReady(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Wi-Fi transfer server could not start.",
      );
      setIsReady(false);
    }

    return () => {
      setIsReady(false);
      server.stop();
    };
  }, []);

  return {
    address: ipAddress ? `http://${ipAddress}:${wifiImportPort}` : "",
    error,
    isReady,
  };
}
