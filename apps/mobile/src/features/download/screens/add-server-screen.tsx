import { useRef, useState } from "react";
import { Alert } from "react-native";
import { router, Stack } from "expo-router";
import { FieldGroup, ListItem, Text } from "@expo/ui";

import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { SECONDARY_LABEL } from "~/features/settings/form";
import { fetchServerInfo, ServerError } from "../client";
import { serverAddress } from "../contract";
import { addServer, newServerId } from "../servers";

function failureMessage(error: unknown) {
  return error instanceof ServerError
    ? error.message
    : "Check the address, and that the server is running.";
}

/** Adds a server: its address, checked before saving. */
export function AddServerScreen() {
  const [address, setAddress] = useState("");
  const [checking, setChecking] = useState(false);
  // The check takes a moment; a second tap must not start another.
  const busy = useRef(false);

  const url = serverAddress(address);

  function save() {
    if (url === null || busy.current) return;
    busy.current = true;
    setChecking(true);
    fetchServerInfo({ url }).then(
      (info) => {
        addServer({ id: newServerId(), name: info.name }, url);
        router.back();
      },
      (error: unknown) => {
        busy.current = false;
        setChecking(false);
        Alert.alert("Couldn't Add Server", failureMessage(error));
      },
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Add Server" }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="checkmark"
          accessibilityLabel="Add Server"
          variant="prominent"
          disabled={url === null}
          onPress={save}
        />
      </Stack.Toolbar>
      <NativeHost style={{ flex: 1 }}>
        <FieldGroup>
          <FieldGroup.Section title="Address">
            <TextInput
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://"
              onChangeText={setAddress}
            />
          </FieldGroup.Section>
          {checking ? (
            <FieldGroup.Section>
              <ListItem>
                <Text textStyle={{ color: SECONDARY_LABEL }}>Checking…</Text>
              </ListItem>
            </FieldGroup.Section>
          ) : null}
        </FieldGroup>
      </NativeHost>
    </>
  );
}
