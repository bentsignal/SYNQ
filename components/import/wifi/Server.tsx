import { useEffect, useRef } from 'react';
import * as server from "expo-http-server";
import * as Network from 'expo-network';
import * as Device from 'expo-device';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getWifiInfo } from '@/lib/SongManager';
import Transfer from '@/assets/static/Transfer';
import { NotificationType } from '@/constants/Types';
import { idgen } from '@/lib/Util';

const getIP = async () => {
  return await Network.getIpAddressAsync();
}

const Server = () => {

  const {

    homeState, results, transferProgress,
    serverStarted,

    addNotification,

    setHomeState, setResults, setTransferSize,
    setExportDisabled, setWifiDisabled, setLoading,
    setIP, setSelectedId, setTransferProgress,
    setLoadAnimInProgress, setShowOverlay,
    setShowNotificationModal, setServerStarted,

  } = useGlobalContext();

  const resultsRef = useRef<Array<any>>([]);
  const homeStateRef = useRef(0);
  const midTransfer = useRef(false);
  const receivedRequests = new Set();

  useEffect(() => {
    resultsRef.current = results
  }, [results]);

  useEffect(() => {
    homeStateRef.current = homeState
  }, [homeState]);

  const PORT = 80;

  const sendErrorNotification = (trace: string) => {
    addNotification(
      NotificationType.ERROR,
      'Server Error',
      'Failed to start server',
      'There was an issue starting the server for web transfer. Restarting the app will usually resolve this',
      trace,
      () => {
        setShowOverlay(true);
        setShowNotificationModal(true);
      }
    );
  }

  useEffect(() => {

    const startServer = async () => {

      if (serverStarted){
        return;
      }
      else {
        setServerStarted(true);
      }

      try {
        setIP(await getIP());
      }
      catch {
        setHomeState(4);
      }

      try {

        server.setup(PORT, (event: server.StatusEvent) => {
          if (event.status == 'ERROR') {
            setWifiDisabled(true);
            setServerStarted(false);
            if (event.message !== 'Address already in use') {
              sendErrorNotification(event.message);
            }
          }
          else {
            setWifiDisabled(false);
          }
        });

        server.route("/", "GET", async (request: server.RequestEvent) => {
          return {
            statusCode: 200,
            statusDescription: "OK",
            contentType: "text/html",
            body: Transfer(),
          };
        });
        
        server.route("/reset", "GET", async (request: server.RequestEvent) => {
          setResults([]);
          return {
            statusCode: 200,
            statusDescription: "OK - RESET RESULTS"
          };
        });

        server.route("/checkConnection", "GET", async (request: server.RequestEvent) => {
          return {
            statusCode: 200,
            statusDescription: "OK - CONNECTED",
            contentType: "text/html",
            body: Device.deviceName ? Device.deviceName : undefined
          };
        });

        server.route('/startTransfer', 'POST', async (request: server.RequestEvent) => {
          if (homeStateRef.current != 1) {
            console.log(homeStateRef.current);
            return ({
              statusCode: 400,
              statusDescription: 'Must be on Wifi Transfer page in app'
            });
          }
          else if (midTransfer.current === true) {
            return ({
              statusCode: 400,
              statusDescription: 'Transfer already in progress'
            });
          }
          else {
            const body = JSON.parse(request.body);
            const size = body.size ? body.size : 0;
            if (size > 2) {
              setLoadAnimInProgress(true);
            }
            setTransferSize(Number(size));
            setTransferProgress(0);
            setLoading(true);
            setExportDisabled(true);
            midTransfer.current = true;
            return ({
              statusCode: 200,
              statusDescription: "OK - READY TO TRANSFER"
            });
          }
        });

        server.route('/finishTransfer', 'POST', async (request: server.RequestEvent) => {
          setLoading(false);
          setExportDisabled(false);
          setTransferSize(0);
          setTransferProgress(0);
          setLoadAnimInProgress(false);
          midTransfer.current = false;
          return ({
            statusCode: 200,
            statusDescription: "OK - FINISHED TRANSFER"
          });
        });

        server.route("/fileUpload", "POST", async (request: server.RequestEvent) => {const body = JSON.parse(request.body);
          const name = body.name ? body.name : '';
          const type = body.type ? body.type : '';
          const b64 = body.data ? body.data : '';
          const id = body.id ? body.id : '';

          if (name && type == 'audio/mpeg' && b64 && !receivedRequests.has(id)) {
            const info = await getWifiInfo(name, id, type, b64);
            if (info) {
              receivedRequests.add(id);
              const newResults = resultsRef.current;
              newResults.push({
                'name': name,
                'id': id,
                'data': b64,
                'info': info
              });
              setResults(newResults);
              resultsRef.current = newResults;
              setTransferProgress(newResults.length);
              setSelectedId(id);
              return {
                statusCode: 200,
                statusDescription: `OK - ${name} RECEIVED`,
              };
            }
            else {
              return {
                statusCode: 409,
                statusDescription: `ERROR - Bad data from ${name}`
              };
            }
          }
          else {
            return {
              statusCode: 409,
              statusDescription: `ERROR - Bad data from ${name}`
            };
          }
        });

        server.start();

        return () => {
          console.log('stop')
          server.stop();
        };

      }
      catch (error) {
        const trace = error instanceof Error ? error.message : String(error);
        sendErrorNotification(trace);
        setWifiDisabled(true);
      }
    }

    startServer();

  }, []);
  
  return (
    <></>
  );

}

export default Server;