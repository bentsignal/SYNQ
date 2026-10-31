import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Device from "expo-device";
import { Directory } from "expo-file-system";
import { Stack, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { ImportList } from "~/features/import/import-list";
import { IMPORT_DIRECTORY } from "~/features/import/pipeline";
import {
  endImportSession,
  receivedImport,
  receivedProgress,
  receiveFailed,
  receivingImport,
  startImportSession,
} from "~/features/import/session";
import {
  TRANSFER_EXTENSIONS,
  transferPage,
} from "~/features/import/transfer-page";
import { synqMedia, synqMediaAvailable } from "~/features/media/native";

/** 2.5.2's port, which people may have bookmarked. */
const PREFERRED_PORT = 3000;

type Server =
  | { state: "starting" }
  | { state: "ready"; address: string }
  | { state: "offline" }
  | { state: "failed" };

function Address({ address }: { address: string }) {
  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="bg-fill mx-5 mt-2 mb-4 items-center gap-2 rounded-2xl px-5 py-6"
    >
      <View className="flex-row items-center gap-2">
        <SymbolIcon name="wifi" size={15} tintColorClassName="accent-accent" />
        <Text className="text-subhead text-muted">
          Open in a browser on the same Wi-Fi
        </Text>
      </View>
      <Text
        selectable
        className="text-title text-foreground font-semibold tabular-nums"
        accessibilityLabel={`Address: ${address}`}
      >
        {address}
      </Text>
    </Animated.View>
  );
}

function Unavailable({
  title,
  symbol,
  onRetry,
}: {
  title: string;
  symbol: "wifi.slash" | "exclamationmark.triangle";
  onRetry: () => void;
}) {
  return (
    <View className="items-center gap-4 px-10 pt-16">
      <SymbolIcon name={symbol} size={40} tintColorClassName="accent-muted" />
      <Text className="text-headline text-foreground text-center font-semibold">
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="bg-fill rounded-full px-6 py-3"
        onPress={onRetry}
      >
        <Text className="text-body text-accent font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );
}

function Header({ server, onRetry }: { server: Server; onRetry: () => void }) {
  switch (server.state) {
    case "starting":
      return (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      );
    case "ready":
      return <Address address={server.address} />;
    case "offline":
      return (
        <Unavailable title="Connect to Wi-Fi" symbol="wifi.slash" onRetry={onRetry} />
      );
    case "failed":
      return (
        <Unavailable
          title="Couldn't Start Wi-Fi Transfer"
          symbol="exclamationmark.triangle"
          onRetry={onRetry}
        />
      );
  }
}

/**
 * Wi-Fi Transfer: while this sheet is open, a web server on the local
 * network takes uploads from a computer's browser; each file is imported
 * as it arrives, like Files.
 */
export default function ImportWifiScreen() {
  const router = useRouter();
  const accent = useCSSVariable("--color-accent");
  const [server, setServer] = useState<Server>({ state: "starting" });
  const [attempt, setAttempt] = useState(0);
  const page = transferPage({
    accent: typeof accent === "string" ? accent : "#77adf8",
    deviceName: Device.deviceName ?? "your iPhone",
  });

  // eslint-disable-next-line no-restricted-syntax -- The batch lives as long as this sheet.
  useEffect(() => {
    startImportSession("wifi");
    track("import_wifi");
    return endImportSession;
  }, []);

  // eslint-disable-next-line no-restricted-syntax -- The web server is an external system that must run exactly while this sheet is open (and restart on Try Again); its uploads arrive as native events.
  useEffect(() => {
    if (!synqMediaAvailable()) {
      setServer({ state: "failed" });
      return;
    }
    const media = synqMedia();
    const uploads = new Directory(IMPORT_DIRECTORY, "wifi");
    const subscriptions = [
      media.addListener("onTransferStart", ({ id, name }) =>
        receivingImport(id, name),
      ),
      media.addListener("onTransferProgress", ({ id, received, size }) =>
        receivedProgress(id, size > 0 ? received / size : 0),
      ),
      media.addListener("onTransferFailed", ({ id }) => receiveFailed(id)),
      media.addListener("onTransferFile", ({ id, mimeType, name, uri }) =>
        receivedImport({ key: id, mimeType, name, uri }),
      ),
      media.addListener("onTransferStopped", () => setServer({ state: "failed" })),
    ];
    let live = true;
    const address = media.wifiAddress();
    if (address === null) {
      setServer({ state: "offline" });
    } else {
      media
        .startTransferServer(PREFERRED_PORT, page, uploads.uri, TRANSFER_EXTENSIONS)
        .then(
          (port) => {
            if (!live) return;
            setServer({
              address: port === 80 ? address : `${address}:${String(port)}`,
              state: "ready",
            });
          },
          () => {
            if (live) setServer({ state: "failed" });
          },
        );
    }
    return () => {
      live = false;
      for (const subscription of subscriptions) subscription.remove();
      media.stopTransferServer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The page is built once per start; a theme change mid-transfer needn't restart the server.
  }, [attempt]);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel="Done"
          variant="prominent"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <ImportList
        header={
          <Header
            server={server}
            onRetry={() => {
              setServer({ state: "starting" });
              setAttempt((n) => n + 1);
            }}
          />
        }
      />
    </>
  );
}
