import { useRef, useState } from "react";
import { Alert } from "react-native";
import { router, Stack } from "expo-router";
import { FieldGroup, ListItem, Text } from "@expo/ui";

import { NativeHost } from "~/components/native-host";
import { TextInput } from "~/components/text-input";
import { Row, SECONDARY_LABEL } from "~/features/settings/form";
import { fetchServerInfo, ServerError } from "../client";
import { serverAddress } from "../contract";
import { addServer, newServerId } from "../servers";

function failureMessage(error: unknown) {
  return error instanceof ServerError
    ? error.message
    : "Check the address, and that the server is running.";
}

/** Adds a server: its address and token, checked together before saving. */
export function AddServerScreen() {
  const [address, setAddress] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [checking, setChecking] = useState(false);
  // The check takes a moment; a second tap must not start another.
  const busy = useRef(false);

  const url = serverAddress(address);
  const canSave = url !== null && token.trim() !== "";

  function save() {
    if (url === null || token.trim() === "" || busy.current) return;
    busy.current = true;
    setChecking(true);
    const typed = token.trim();
    fetchServerInfo({ token: typed, url }).then(
      (info) => {
        addServer({ id: newServerId(), name: info.name, url }, typed);
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
          disabled={!canSave}
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
          <FieldGroup.Section title="Token">
            <TextInput
              key={showToken ? "shown" : "hidden"}
              defaultValue={token}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Token"
              secureTextEntry={!showToken}
              onChangeText={setToken}
            />
            <Row
              icon={showToken ? "eye.slash" : "eye"}
              label={showToken ? "Hide Token" : "Show Token"}
              trailing="none"
              onPress={() => setShowToken(!showToken)}
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
