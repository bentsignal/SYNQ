import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Toggle } from "@expo/ui/swift-ui";
import { labelsHidden } from "@expo/ui/swift-ui/modifiers";

import type { WifiTransferState } from "~/features/import/wifi-transfer";
import { EmptyState } from "~/components/empty-state";
import { SymbolIcon } from "~/components/symbol-icon";
import { track } from "~/features/analytics/analytics";
import { onTransferStart } from "~/features/import/session";
import { displayAddress } from "~/features/import/transfer-link";
import {
  canCopyAddress,
  canShowConnected,
  copyAddress,
  openWifiTransfer,
  retryWifiTransfer,
  setTransfersOn,
  useWifiTransfer,
} from "~/features/import/wifi-transfer";
import { FormHost } from "~/features/settings/form";
import { cn } from "~/lib/cn";
import { selectionTick } from "~/lib/haptics";

/** How long Copy shows its checkmark. */
const COPIED_MS = 1500;
/** From the sheet's top, past its bar, to the first row. */
const CONTENT_TOP = 84;
const ROW_HEIGHT = 50;

function serverOf({ server }: WifiTransferState) {
  return server;
}

function onOf({ on }: WifiTransferState) {
  return on;
}

function connectedOf({ connected }: WifiTransferState) {
  return connected;
}

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  if (!canCopyAddress()) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={copied ? "Copied" : "Copy Address"}
      hitSlop={12}
      className="active:opacity-60"
      onPress={() => {
        copyAddress(address);
        selectionTick();
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_MS);
      }}
    >
      <SymbolIcon
        name={copied ? "checkmark" : "doc.on.doc"}
        size={18}
        tintColorClassName="accent-accent"
      />
    </Pressable>
  );
}

function ComputerRow() {
  const connected = useWifiTransfer(connectedOf);
  if (!canShowConnected()) return null;
  return (
    <>
      <RowLine />
      <SheetRow>
        <Text className="text-body text-foreground">Computer</Text>
        <Text
          className={cn(
            "text-body",
            connected ? "text-foreground" : "text-muted",
          )}
        >
          {connected ? "Connected" : "Not Connected"}
        </Text>
      </SheetRow>
    </>
  );
}

function SheetRow({ children }: { children: ReactNode }) {
  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{ minHeight: ROW_HEIGHT }}
    >
      {children}
    </View>
  );
}

function RowLine() {
  return <View className="ml-4 bg-white/15" style={{ height: 1 }} />;
}

function Card({ children }: { children: ReactNode }) {
  return <View className="rounded-[25px] bg-white/10">{children}</View>;
}

/**
 * Wi-Fi Transfer: the switch that allows uploads, and the address to open on
 * a computer. The server and the switch outlive this sheet, so someone can
 * close it and go on using the app while they send files. It closes itself
 * when files start arriving, and the capsule takes over.
 */
export default function ImportWifiScreen() {
  const router = useRouter();
  const server = useWifiTransfer(serverOf);
  const on = useWifiTransfer(onOf);

  // eslint-disable-next-line no-restricted-syntax -- Opening this sheet is what first starts the server (the prompt mustn't come at launch), and its listener must go when the sheet does, however it closes.
  useEffect(() => {
    openWifiTransfer();
    track("import_wifi");
    return onTransferStart(() => router.back());
  }, [router]);

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      {server.state === "offline" || server.state === "failed" ? (
        <View className="flex-1 justify-center">
          <EmptyState
            compact
            icon={
              server.state === "offline"
                ? "wifi.slash"
                : "exclamationmark.triangle"
            }
            title={
              server.state === "offline"
                ? "Connect to Wi-Fi"
                : "Couldn't Start Wi-Fi Transfer"
            }
            actions={[{ label: "Try Again", onPress: retryWifiTransfer }]}
          />
        </View>
      ) : (
        // Plain views rather than a form: nothing here scrolls, so iOS has no
        // reason to draw its band under the bar.
        <View className="flex-1 px-4" style={{ paddingTop: CONTENT_TOP }}>
          <Card>
            <SheetRow>
              <Text className="text-body text-foreground">Allow Transfers</Text>
              <FormHost matchContents>
                <Toggle
                  label="Allow Transfers"
                  isOn={on}
                  modifiers={[labelsHidden()]}
                  onIsOnChange={setTransfersOn}
                />
              </FormHost>
            </SheetRow>
          </Card>
          {/* An older binary's server runs only while transfers are on. */}
          {server.state === "idle" && !canShowConnected() ? null : (
            <>
              <Text className="text-subhead text-muted mx-4 mt-5 mb-2 font-semibold">
                Open in a browser on the same Wi-Fi
              </Text>
              <Card>
                <SheetRow>
                  {server.state === "ready" ? (
                    <>
                      <Text
                        selectable
                        className="text-body text-foreground font-medium tabular-nums"
                      >
                        {fullAddress(server)}
                      </Text>
                      <CopyButton address={fullAddress(server)} />
                    </>
                  ) : (
                    <ActivityIndicator />
                  )}
                </SheetRow>
                <ComputerRow />
              </Card>
            </>
          )}
        </View>
      )}
    </>
  );
}

function fullAddress(server: { address: string; port: number }) {
  return displayAddress(server.address, server.port);
}
