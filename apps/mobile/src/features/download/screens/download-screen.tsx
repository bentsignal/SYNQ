import type { TextInputRef } from "@expo/ui";
import type { PasteEventPayload } from "expo-clipboard";
import { useRef, useState } from "react";
import { Alert } from "react-native";
import { ClipboardPasteButton, isPasteButtonAvailable } from "expo-clipboard";
import { router, Stack } from "expo-router";
import {
  FieldGroup,
  Row as Line,
  ListItem,
  Picker,
  RNHostView,
  Text,
} from "@expo/ui";

import type { Download } from "../engine";
import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { Row } from "~/features/settings/form";
import { selectionTick } from "~/lib/haptics";
import { downloads, useDownloads } from "../downloads";
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

function statusLine(download: Download) {
  if (download.message !== null) return download.message;
  if (download.state === "starting" || download.total === 0) return "Starting…";
  return `${String(download.done + download.failed)} of ${String(download.total)}`;
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
      supportingText={statusLine(download)}
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

/**
 * Starts a download from what's copied, in one tap. iOS doesn't ask for
 * permission, as it does when an app reads the clipboard itself.
 */
function PasteButton({ onPaste }: { onPaste: (text: string) => void }) {
  if (!isPasteButtonAvailable) return null;
  return (
    <RNHostView matchContents>
      <ClipboardPasteButton
        acceptedContentTypes={["plain-text"]}
        displayMode="iconOnly"
        style={{ height: 44, width: 44 }}
        onPress={(data: PasteEventPayload) => {
          if (data.type === "text") onPaste(data.text);
        }}
      />
    </RNHostView>
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
        <FieldGroup>
          <ServerSection serverId={serverId} onChoose={setChosenId} />
          <FieldGroup.Section>
            <Line alignment="center" spacing={8}>
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
              {serverId === null ? null : (
                <PasteButton onPaste={(text) => start(text.trim())} />
              )}
            </Line>
          </FieldGroup.Section>
          <DownloadRows />
        </FieldGroup>
      </NativeHost>
    </>
  );
}
