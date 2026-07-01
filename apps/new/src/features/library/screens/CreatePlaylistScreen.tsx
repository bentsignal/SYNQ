import { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createPlaylist } from "../repository/playlist-repository";

export function CreatePlaylistScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && !isSaving;

  const handleCreate = async () => {
    if (!canSave) {
      setError("Playlist name is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const playlist = await createPlaylist(name);
      router.replace(`/(tabs)/library/playlist/${playlist.id}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Playlist could not be created.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Playlist</Text>
        <Text style={styles.title}>Create playlist</Text>
        <Text style={styles.subtitle}>
          Creates a playlist row in the shared library database. The Library
          screen updates through live queries.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isSaving}
          onChangeText={setName}
          placeholder="Playlist name"
          placeholderTextColor="#74807a"
          returnKeyType="done"
          style={styles.input}
          value={name}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleCreate}
          style={[styles.saveButton, !canSave ? styles.disabledButton : null]}
        >
          {isSaving ? <ActivityIndicator color="#ffffff" /> : null}
          <Text style={styles.saveText}>
            {isSaving ? "Creating" : "Create playlist"}
          </Text>
        </Pressable>
      </View>

      <Link href="/(tabs)/library" style={styles.backLink}>
        Back to Library
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f4f7f5",
    flex: 1,
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 56,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121417",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#52605a",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  form: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  label: {
    color: "#52605a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  input: {
    borderColor: "#dbe3de",
    borderRadius: 8,
    borderWidth: 1,
    color: "#121417",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: "#8da39d",
  },
  saveText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  errorText: {
    color: "#b42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  backLink: {
    color: "#0f766e",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
