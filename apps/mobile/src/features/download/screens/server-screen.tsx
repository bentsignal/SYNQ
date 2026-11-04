import { useState } from "react";
import { Alert, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { FieldGroup, ListItem, Switch, Text } from "@expo/ui";
// eslint-disable-next-line no-restricted-imports -- This asks a remote server, which may be asleep or gone; the screen must show without waiting for it.
import { useQuery } from "@tanstack/react-query";

import type { ServerInfo } from "../contract";
import type { DownloadServer } from "../servers";
import { NativeHost } from "~/components/native-host";
import { Row, SECONDARY_LABEL } from "~/features/settings/form";
import { fetchServerInfo, ServerError } from "../client";
import {
  removeServer,
  serverAccess,
  serverToken,
  setDefaultServer,
  useServers,
} from "../servers";

function serversOf({ servers }: { servers: readonly DownloadServer[] }) {
  return servers;
}

function defaultOf({ defaultId }: { defaultId: string | null }) {
  return defaultId;
}

const HIDDEN_TOKEN = "••••••••••••";

function usageLine(info: { usedToday: number; dailyLimit: number | null }) {
  const used = String(info.usedToday);
  return info.dailyLimit === null
    ? `${used} ${info.usedToday === 1 ? "song" : "songs"}`
    : `${used} of ${String(info.dailyLimit)} songs`;
}

/** What the server says about this token right now. */
function useServerStatus(id: string) {
  return useQuery({
    queryFn: () => {
      const access = serverAccess(id);
      if (access === null) throw new Error("No such server.");
      return fetchServerInfo(access);
    },
    queryKey: ["download-server", id],
    retry: false,
    select: usageOf,
  });
}

function usageOf({ dailyLimit, usedToday }: ServerInfo) {
  return { dailyLimit, usedToday };
}

function StatusRows({ id }: { id: string }) {
  const { data, error, isPending } = useServerStatus(id);
  const status = isPending
    ? "Checking…"
    : data !== undefined
      ? "Connected"
      : error instanceof ServerError
        ? error.message
        : "Can't Reach Server";
  return (
    <>
      <ListItem trailing={<Text textStyle={{ color: SECONDARY_LABEL }}>{status}</Text>}>
        <Text>Status</Text>
      </ListItem>
      {data === undefined ? null : (
        <ListItem
          trailing={<Text textStyle={{ color: SECONDARY_LABEL }}>{usageLine(data)}</Text>}
        >
          <Text>Used Today</Text>
        </ListItem>
      )}
    </>
  );
}

function confirmRemove(server: DownloadServer) {
  Alert.alert(`Remove ${server.name}?`, undefined, [
    { style: "cancel", text: "Cancel" },
    {
      onPress: () => {
        removeServer(server.id);
        router.back();
      },
      style: "destructive",
      text: "Remove",
    },
  ]);
}

/** One server: whether it's reachable, its token (hidden until asked), and its settings. */
export function ServerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const servers = useServers(serversOf);
  const defaultId = useServers(defaultOf);
  const [revealed, setRevealed] = useState<string | null>(null);
  const server = servers.find((candidate) => candidate.id === id);
  if (server === undefined) return <View />;
  return (
    <>
      <Stack.Screen options={{ title: server.name }} />
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            <ListItem trailing={<Text textStyle={{ color: SECONDARY_LABEL }}>{server.url}</Text>}>
              <Text>Address</Text>
            </ListItem>
            <StatusRows id={server.id} />
          </FieldGroup.Section>
          <FieldGroup.Section title="Token">
            <ListItem>
              <Text>{revealed ?? HIDDEN_TOKEN}</Text>
            </ListItem>
            <Row
              icon={revealed === null ? "eye" : "eye.slash"}
              label={revealed === null ? "Show Token" : "Hide Token"}
              trailing="none"
              onPress={() =>
                setRevealed(revealed === null ? serverToken(server.id) : null)
              }
            />
          </FieldGroup.Section>
          <FieldGroup.Section>
            <Switch
              label="Default Server"
              value={defaultId === server.id}
              onValueChange={(on) => {
                if (on) setDefaultServer(server.id);
              }}
            />
          </FieldGroup.Section>
          <FieldGroup.Section>
            <Row
              icon="trash"
              label="Remove Server"
              trailing="none"
              onPress={() => confirmRemove(server)}
            />
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}
