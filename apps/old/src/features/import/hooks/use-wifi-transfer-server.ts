import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Network from "expo-network";
import { usePathname } from "expo-router";
import { BridgeServer } from "react-native-http-bridge-refurbished";
import Transfer from "@/src/assets/static/Transfer";
import CFG from "@/src/constants/Config";
import { useImportFlowContext } from "@/src/features/import/context/ImportFlowProvider";
import {
  createImportDir,
  getWifiTransferSong,
} from "@/src/features/import/lib/import-song-processing";
import {
  isAcceptedWifiUpload,
  parseWifiUploadRequest,
} from "@/src/features/import/lib/wifi-upload-request";

const getIP = async () => {
  return await Network.getIpAddressAsync();
};

export function useWifiTransferServer() {
  const {
    setResults,
    setTransferSize,
    setExportDisabled,
    setLoading,
    setIP,
    setSelectedId,
    setTransferProgress,
    setLoadAnimInProgress,
  } = useImportFlowContext();

  const pathname = usePathname();
  const allowTransfer = useRef(false);
  const midTransfer = useRef(false);
  const receivedRequests = useRef(new Set<number>());

  useEffect(() => {
    allowTransfer.current = pathname === "/import/wifi";
  }, [pathname]);

  useEffect(() => {
    const loadIP = async () => {
      try {
        setIP(await getIP());
      } catch (error) {
        console.log("error getting IP", error);
      }
    };

    void loadIP();
  }, [setIP]);

  useEffect(() => {
    const server = new BridgeServer("http_service", true);
    server.listen(CFG.PORT);

    server.get("/", async (req: any, res: any) => {
      return res.html(Transfer());
    });

    server.get("/reset", async (req: any, res: any) => {
      setResults([]);
      return res.json({
        status: 200,
        message: "OK - RESET RESULTS",
      });
    });

    server.get("/checkConnection", async (req: any, res: any) => {
      return res.json({
        deviceName: Device.deviceName,
      });
    });

    server.post("/startTransfer", async (req: any, res: any) => {
      if (!allowTransfer.current) {
        return res.json({
          status: 400,
          message: "Must be on Wifi Transfer page in app",
        });
      }

      if (midTransfer.current === true) {
        return res.json({
          status: 400,
          message: "Transfer already in progress",
        });
      }

      if (
        req.postData.size !== null &&
        req.postData.size !== undefined &&
        req.postData.size !== 0
      ) {
        const size = req.postData.size;
        if (size > 2) {
          setLoadAnimInProgress(true);
        }
        setTransferSize(Number(size));
        setTransferProgress(0);
        setLoading(true);
        setExportDisabled(true);
        midTransfer.current = true;
        await createImportDir();
        return res.json({
          status: 200,
          message: "OK - READY TO TRANSFER",
        });
      }

      return res.json({
        status: 400,
        message: "No data to transfer",
      });
    });

    server.post("/finishTransfer", async (req: any, res: any) => {
      setLoading(false);
      setExportDisabled(false);
      setTransferSize(0);
      setTransferProgress(0);
      setLoadAnimInProgress(false);
      midTransfer.current = false;
      return res.json({
        status: 200,
        message: "OK - FINISHED TRANSFER",
      });
    });

    server.post("/fileUpload", async (req: any, res: any) => {
      try {
        const { b64, id, name, type } = parseWifiUploadRequest(req.postData);

        if (
          isAcceptedWifiUpload({ b64, id, name, type }) &&
          !receivedRequests.current.has(id)
        ) {
          const song = await getWifiTransferSong(name, id, type, b64);
          if (song) {
            receivedRequests.current.add(id);
            setResults((currentResults) => {
              const newResults = [...currentResults, song];
              setTransferProgress(newResults.length);
              return newResults;
            });
            setSelectedId(id);
            return res.json({
              status: 200,
              message: `OK - ${name} RECEIVED`,
            });
          }
        }

        return res.json({
          status: 409,
          message: `ERROR - Bad data from ${name}`,
        });
      } catch (error) {
        console.log("error uploading song:", error);
        return res.json({
          status: 500,
          message: `ERROR - Failed to upload song: ${error}`,
        });
      }
    });

    return () => {
      server.stop();
    };
  }, [
    setExportDisabled,
    setLoadAnimInProgress,
    setLoading,
    setResults,
    setSelectedId,
    setTransferProgress,
    setTransferSize,
  ]);
}
