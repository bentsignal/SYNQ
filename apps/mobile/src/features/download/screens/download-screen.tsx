import type { TextInputRef } from "@expo/ui";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { router, Stack } from "expo-router";
import { FieldGroup, Row as Line, ListItem, Picker, Text } from "@expo/ui";
import { Button, Image } from "@expo/ui/swift-ui";
import {
  animation,
  Animation,
  buttonStyle,
  disabled,
} from "@expo/ui/swift-ui/modifiers";

import type { Download } from "../engine";
import { NativeHost, useNativeColor } from "~/components/native-host";
import { SymbolIcon } from "~/components/symbol-icon";
import { TextInput } from "~/components/text-input";
import { Row, SECONDARY_LABEL } from "~/features/settings/form";
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
      trailing={
        isWorking(download) ? (
          <ActivityIndicator />
        ) : (
          <SymbolIcon
            name="xmark"
            size={14}
            weight="semibold"
            tintColor={SECONDARY_LABEL}
          />
        )
      }
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

/** The link to download, with a button inside the field to start it. */
function LinkField({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [link, setLink] = useState("");
  const input = useRef<TextInputRef>(null);
  const accent = useNativeColor("--color-accent");
  const empty = link.trim() === "";

  function submit() {
    if (empty) return;
    onSubmit(link.trim());
    setLink("");
    input.current?.clear();
  }

  return (
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
          onSubmitEditing={submit}
        />
        <Button
          modifiers={[buttonStyle("plain"), disabled(empty)]}
          onPress={submit}
        >
          <Image
            systemName="arrow.down.circle.fill"
            size={28}
            color={empty ? SECONDARY_LABEL : accent}
          />
        </Button>
      </Line>
    </FieldGroup.Section>
  );
}

/**
 * Download (docs/ui.md → Import): the server to send a link to, the link, and
 * what's on its way. Songs go through the import queue as they arrive, so this sheet
 * can close at any time.
 */
export function DownloadScreen() {
  const [chosenId, setChosenId] = useState<string | null>(null);
  const serverId = useServerId(chosenId);
  const rows = useDownloads().length;

  function start(url: string) {
    if (serverId === null || url === "") return;
    downloads.start(serverId, url);
    selectionTick();
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
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup modifiers={[animation(Animation.default, rows)]}>
          <ServerSection serverId={serverId} onChoose={setChosenId} />
          {serverId === null ? null : <LinkField onSubmit={start} />}
          <DownloadRows />
        </FieldGroup>
      </NativeHost>
    </>
  );
}
