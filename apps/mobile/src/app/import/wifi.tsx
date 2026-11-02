import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Device from "expo-device";
import { Directory } from "expo-file-system";
import { Stack, useRouter } from "expo-router";
import { useCSSVariable } from "uniwind";

import { EmptyState } from "~/components/empty-state";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { IMPORT_DIRECTORY } from "~/features/import/pipeline";
import { parseUploadType } from "~/features/import/progress";
import {
  closeTransfer,
  openTransfer,
  uploadFailed,
  uploadProgressed,
  uploadReceived,
  uploadsStopped,
  uploadStarted,
} from "~/features/import/session";
import {
  TRANSFER_EXTENSIONS,
  transferPage,
} from "~/features/import/transfer-page";
import { TransferProgress } from "~/features/import/transfer-progress";
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
        <EmptyState
          compact
          icon="wifi.slash"
          title="Connect to Wi-Fi"
          actions={[{ label: "Try Again", onPress: onRetry }]}
        />
      );
    case "failed":
      return (
        <EmptyState
          compact
          icon="exclamationmark.triangle"
          title="Couldn't Start Wi-Fi Transfer"
          actions={[{ label: "Try Again", onPress: onRetry }]}
        />
      );
  }
}

/** The device's Wi-Fi address, or null when it isn't on Wi-Fi (or can't serve). */
function readAddress() {
  return synqMediaAvailable() ? synqMedia().wifiAddress() : null;
}

/** What the server is doing, from the address and the latest start's outcome. */
function serverState(
  address: string | null,
  attempt: number,
  started: { attempt: number; port: number | null } | null,
) {
  if (!synqMediaAvailable()) return { state: "failed" } satisfies Server;
  if (address === null) return { state: "offline" } satisfies Server;
  if (started?.attempt !== attempt)
    return { state: "starting" } satisfies Server;
  if (started.port === null) return { state: "failed" } satisfies Server;
  return {
    address:
      started.port === 80 ? address : `${address}:${String(started.port)}`,
    state: "ready",
  } satisfies Server;
}

/**
 * Wi-Fi Transfer: while this sheet is open, a web server on the local
 * network takes uploads from a computer's browser, and each file imports as
 * it arrives. The sheet shows the address, then the progress, and closes
 * itself when the transfer is complete (`completionDelay`).
 */
export default function ImportWifiScreen() {
  const router = useRouter();
  const accentValue = useCSSVariable("--color-accent");
  const accent = typeof accentValue === "string" ? accentValue : "#77adf8";
  const [address, setAddress] = useState(readAddress);
  const [attempt, setAttempt] = useState(0);
  const [started, setStarted] = useState<{
    attempt: number;
    port: number | null;
  } | null>(null);

  // eslint-disable-next-line no-restricted-syntax -- The transfer lives exactly as long as this sheet, however the sheet closes.
  useEffect(() => {
    openTransfer(() => router.back());
    track("import_wifi");
    return closeTransfer;
  }, [router]);

  // eslint-disable-next-line no-restricted-syntax -- The web server is an external system that must run exactly while this sheet is open (and restart on Try Again); its uploads arrive as native events.
  useEffect(() => {
    if (address === null || !synqMediaAvailable()) return;
    const media = synqMedia();
    let live = true;
    function settle(port: number | null) {
      if (live) setStarted({ attempt, port });
    }
    const subscriptions = [
      media.addListener("onTransferStart", ({ id, name }) =>
        uploadStarted(id, name),
      ),
      media.addListener("onTransferProgress", ({ id, received, size }) =>
        uploadProgressed(id, size > 0 ? received / size : 0),
      ),
      media.addListener("onTransferFailed", ({ id }) => uploadFailed(id)),
      media.addListener("onTransferFile", ({ id, mimeType, name, uri }) => {
        const upload = parseUploadType(mimeType);
        uploadReceived(
          { key: id, mimeType: upload.mimeType, name, uri },
          upload.remaining,
        );
      }),
      media.addListener("onTransferStopped", () => {
        uploadsStopped();
        settle(null);
      }),
    ];
    const page = transferPage({
      accent,
      deviceName: Device.deviceName ?? "your iPhone",
    });
    const uploads = new Directory(IMPORT_DIRECTORY, "wifi");
    media
      .startTransferServer(
        PREFERRED_PORT,
        page,
        uploads.uri,
        TRANSFER_EXTENSIONS,
      )
      .then(settle, () => settle(null));
    return () => {
      live = false;
      for (const subscription of subscriptions) subscription.remove();
      media.stopTransferServer();
      uploadsStopped();
    };
  }, [accent, address, attempt]);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <ScrollView
        className="bg-background flex-1"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Header
          server={serverState(address, attempt, started)}
          onRetry={() => {
            setAddress(readAddress());
            setAttempt((n) => n + 1);
          }}
        />
        <TransferProgress />
      </ScrollView>
    </>
  );
}
