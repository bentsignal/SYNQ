import type { TextInputRef } from "@expo/ui";
import type { PasteEventPayload } from "expo-clipboard";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, useWindowDimensions } from "react-native";
import { ClipboardPasteButton, isPasteButtonAvailable } from "expo-clipboard";
import { router, Stack } from "expo-router";
import { FieldGroup, ListItem, Picker, RNHostView, Text } from "@expo/ui";
import { HStack } from "@expo/ui/swift-ui";
import {
  animation,
  Animation,
  listRowBackground,
  listRowInsets,
} from "@expo/ui/swift-ui/modifiers";

import type { Download } from "../engine";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { Row } from "~/features/settings/form";
import { selectionTick } from "~/lib/haptics";
import { downloads, useDownloads } from "../downloads";
import { downloadLine } from "../job-counts";
import { useServers } from "../servers";

function serversOf({
  servers,
}: {
  servers: readonly { id: string; name: string }[];
}) {
  return servers;
}

function defaultOf({ defaultId }: { defaultId: string | null }) {
  return defaultId;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isWorking({ state }: Download) {
  return state === "starting" || state === "running";
}

function confirmRemove(download: Download) {
  if (download.state === "failed" || download.state === "finished") {
    downloads.cancel(download.key);
    return;
  }
  Alert.alert("Cancel Download?", undefined, [
    { style: "cancel", text: "Keep Downloading" },
    {
      onPress: () => downloads.cancel(download.key),
      style: "destructive",
      text: "Cancel Download",
    },
  ]);
}

function DownloadRow({ download }: { download: Download }) {
  return (
    <ListItem
      supportingText={downloadLine(download) ?? undefined}
      trailing={isWorking(download) ? <ActivityIndicator /> : undefined}
      onPress={() => confirmRemove(download)}
    >
      <Text>{download.title ?? hostOf(download.url)}</Text>
    </ListItem>
  );
}

function ServerSection({
  serverId,
  onChoose,
}: {
  serverId: string | null;
  onChoose: (id: string) => void;
}) {
  const servers = useServers(serversOf);
  const [only] = servers;
  if (only === undefined) {
    return (
      <FieldGroup.Section title="Server">
        <Row
          icon="plus"
          label="Add Server"
          onPress={() => router.push("/import/download/add-server")}
        />
      </FieldGroup.Section>
    );
  }
  return (
    <FieldGroup.Section title="Server">
      {serverId !== null && servers.length > 1 ? (
        <Picker
          selectedValue={serverId}
          onValueChange={(id) => onChoose(String(id))}
        >
          {servers.map((server) => (
            <Picker.Item
              key={server.id}
              label={server.name}
              value={server.id}
            />
          ))}
        </Picker>
      ) : null}
      <Row
        icon="server.rack"
        label={servers.length === 1 ? only.name : "Servers"}
        onPress={() => router.push("/import/download/servers")}
      />
    </FieldGroup.Section>
  );
}

function DownloadRows() {
  const active = useDownloads();
  if (active.length === 0) return null;
  return (
    <FieldGroup.Section title="Downloads">
      {active.map((item) => (
        <DownloadRow key={item.key} download={item} />
      ))}
    </FieldGroup.Section>
  );
}

/** The server this download goes to: the one chosen, or else the default. */
function useServerId(chosenId: string | null) {
  const servers = useServers(serversOf);
  const defaultId = useServers(defaultOf);
  const chosen = servers.find((server) => server.id === chosenId);
  return chosen?.id ?? defaultId ?? servers[0]?.id ?? null;
}

/** The form's side margins, which the button lines up with. */
const SECTION_MARGIN = 16;
const PASTE_HEIGHT = 50;
const NO_FILL = "#00000000";

/**
 * Starts a download from what's copied, in one tap. iOS doesn't ask for
 * permission, as it does when an app reads the clipboard itself, and in return
 * it fixes the button's wording.
 */
function PasteButton({ onPaste }: { onPaste: (text: string) => void }) {
  const { width } = useWindowDimensions();
  if (!isPasteButtonAvailable) return null;
  return (
    <FieldGroup.Section>
      <HStack
        modifiers={[
          listRowBackground(NO_FILL),
          listRowInsets({ bottom: 0, leading: 0, top: 0, trailing: 0 }),
        ]}
      >
        <RNHostView matchContents>
          <ClipboardPasteButton
            acceptedContentTypes={["plain-text"]}
            displayMode="iconAndLabel"
            style={{
              height: PASTE_HEIGHT,
              width: width - SECTION_MARGIN * 2,
            }}
            onPress={(data: PasteEventPayload) => {
              if (data.type === "text") onPaste(data.text);
            }}
          />
        </RNHostView>
      </HStack>
    </FieldGroup.Section>
  );
}

/**
 * Download (docs/ui.md → Import): the server to send a link to, the link, and
 * what's on its way. Songs go through the import queue as they arrive, so this sheet
 * can close at any time.
 */
export function DownloadScreen() {
  const [link, setLink] = useState("");
  const [chosenId, setChosenId] = useState<string | null>(null);
  const serverId = useServerId(chosenId);
  const input = useRef<TextInputRef>(null);
  const rows = useDownloads().length;

  function start(url: string) {
    if (serverId === null || url === "") return;
    downloads.start(serverId, url);
    selectionTick();
  }

  function download() {
    start(link.trim());
    setLink("");
    input.current?.clear();
  }

  return (
    <>
      <Stack.Screen options={{ title: "Download" }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="arrow.down"
          accessibilityLabel="Download"
          variant="prominent"
          disabled={serverId === null || link.trim() === ""}
          onPress={download}
        />
      </Stack.Toolbar>
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup modifiers={[animation(Animation.default, rows)]}>
          <ServerSection serverId={serverId} onChoose={setChosenId} />
          <FieldGroup.Section>
            <TextInput
              ref={input}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              enterKeyHint="go"
              keyboardType="url"
              placeholder="Paste a Link"
              onChangeText={setLink}
              onSubmitEditing={download}
            />
          </FieldGroup.Section>
          {serverId === null ? null : (
            <PasteButton onPaste={(text) => start(text.trim())} />
          )}
          <DownloadRows />
        </FieldGroup>
      </NativeHost>
    </>
  );
}
