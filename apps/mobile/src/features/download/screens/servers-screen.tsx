import { router, Stack } from "expo-router";
import { FieldGroup } from "@expo/ui";

import type { DownloadServer } from "../servers";
import { NativeHost } from "~/components/native-host";
import { Row } from "~/features/settings/form";
import { useServers } from "../servers";

function serversOf({ servers }: { servers: readonly DownloadServer[] }) {
  return servers;
}

function defaultOf({ defaultId }: { defaultId: string | null }) {
  return defaultId;
}

/** Every server added, with the default marked. */
export function ServersScreen() {
  const servers = useServers(serversOf);
  const defaultId = useServers(defaultOf);
  return (
    <>
      <Stack.Screen options={{ title: "Servers" }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel="Add Server"
          onPress={() => router.push("/import/download/add-server")}
        />
      </Stack.Toolbar>
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section>
            {servers.map((server) => (
              <Row
                key={server.id}
                icon="server.rack"
                label={server.name}
                detail={server.id === defaultId ? "Default" : undefined}
                onPress={() =>
                  router.push({
                    params: { id: server.id },
                    pathname: "/import/download/server",
                  })
                }
              />
            ))}
          </FieldGroup.Section>
        </FieldGroup>
      </NativeHost>
    </>
  );
}
