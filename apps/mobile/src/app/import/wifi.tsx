import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Button, FieldGroup, ListItem, Switch } from "@expo/ui";
import { Image, Text } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  font,
  foregroundStyle,
  monospacedDigit,
  scrollContentBackground,
  textSelection,
} from "@expo/ui/swift-ui/modifiers";

import type { WifiTransferState } from "~/features/import/wifi-transfer";
import { EmptyState } from "~/components/empty-state";
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
import { usePreference } from "~/features/preferences/store";
import { themeAccent } from "~/features/preferences/themes";
import { FormHost, SECONDARY_LABEL } from "~/features/settings/form";
import { selectionTick } from "~/lib/haptics";

/** How long Copy shows its checkmark. */
const COPIED_MS = 1500;

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
  const accent = themeAccent(usePreference("theme"));
  if (!canCopyAddress()) return null;
  return (
    <Button
      variant="text"
      modifiers={[accessibilityLabel(copied ? "Copied" : "Copy Address")]}
      onPress={() => {
        copyAddress(address);
        selectionTick();
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_MS);
      }}
    >
      <Image
        systemName={copied ? "checkmark" : "doc.on.doc"}
        size={17}
        color={accent}
      />
    </Button>
  );
}

function ComputerRow() {
  const connected = useWifiTransfer(connectedOf);
  if (!canShowConnected()) return null;
  return (
    <ListItem
      trailing={
        <Text
          modifiers={[
            font({ size: 17 }),
            foregroundStyle(connected ? "#ffffff" : SECONDARY_LABEL),
          ]}
        >
          {connected ? "Connected" : "Not Connected"}
        </Text>
      }
    >
      <Text>Computer</Text>
    </ListItem>
  );
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
        <FormHost style={{ flex: 1 }}>
          <FieldGroup modifiers={[scrollContentBackground("hidden")]}>
            <FieldGroup.Section>
              <Switch
                label="Allow Transfers"
                value={on}
                onValueChange={setTransfersOn}
              />
            </FieldGroup.Section>
            {/* An older binary's server runs only while transfers are on. */}
            {server.state === "idle" && !canShowConnected() ? null : (
              <FieldGroup.Section title="Open in a browser on the same Wi-Fi">
                {server.state === "ready" ? (
                  <ListItem
                    trailing={<CopyButton address={fullAddress(server)} />}
                  >
                    <Text
                      modifiers={[
                        font({ size: 17, weight: "medium" }),
                        monospacedDigit(),
                        textSelection(true),
                      ]}
                    >
                      {fullAddress(server)}
                    </Text>
                  </ListItem>
                ) : (
                  <ListItem>
                    <ActivityIndicator />
                  </ListItem>
                )}
                <ComputerRow />
              </FieldGroup.Section>
            )}
          </FieldGroup>
        </FormHost>
      )}
    </>
  );
}

function fullAddress(server: { address: string; port: number }) {
  return displayAddress(server.address, server.port);
}
