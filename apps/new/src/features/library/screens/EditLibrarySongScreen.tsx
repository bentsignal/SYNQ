import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { parseNumericRouteParam } from "@/src/features/app-shell/services/route-param-service";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import { EditLibrarySongFormView } from "../components/EditLibrarySongFormView";
import { useEditLibrarySongController } from "../hooks/use-edit-library-song-controller";
import { useLibrarySongDetailQuery } from "../hooks/use-library-song-detail-query";

export function EditLibrarySongScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const theme = useCustomizationTheme();
  const id = parseNumericRouteParam(params.id);

  if (id === null) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Text style={[styles.kicker, { color: theme.accent }]}>Edit song</Text>
        <Text style={[styles.title, { color: theme.primaryText }]}>
          Invalid song
        </Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          This route needs a numeric id.
        </Text>
        <Link
          href="/(tabs)/library"
          style={[styles.backLink, { color: theme.accent }]}
        >
          Back to Library
        </Link>
      </View>
    );
  }

  return <EditLibrarySongContent songId={id} />;
}

function EditLibrarySongContent({ songId }: { songId: number }) {
  const { detail, errors } = useLibrarySongDetailQuery(songId);
  const hasErrors = errors.length > 0;
  const {
    actionState,
    albumNames,
    artistNames,
    errorMessage,
    save,
    setAlbumNames,
    setArtistNames,
    setTitle,
    title,
  } = useEditLibrarySongController({
    detail,
    songId,
  });

  return (
    <EditLibrarySongFormView
      actionState={actionState}
      albumNames={albumNames}
      artistNames={artistNames}
      detail={detail}
      errorMessage={errorMessage}
      hasErrors={hasErrors}
      onChangeAlbumNames={setAlbumNames}
      onChangeArtistNames={setArtistNames}
      onChangeTitle={setTitle}
      onSave={save}
      songId={songId}
      title={title}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 520,
  },
  backLink: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
  },
});
