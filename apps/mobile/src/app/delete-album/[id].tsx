import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Toggle } from "@expo/ui/swift-ui";
import { labelsHidden } from "@expo/ui/swift-ui/modifiers";

import { removeAlbum } from "~/features/library/actions";
import { useIdParam } from "~/features/library/params";
import { FormHost } from "~/features/settings/form";

/** From the sheet's top, past its bar, to the first line. */
const CONTENT_TOP = 72;
const ROW_HEIGHT = 50;

function deleteSongsLabel(count: number) {
  return count === 1
    ? "Also Delete 1 Song"
    : `Also Delete ${count.toLocaleString("en-US")} Songs`;
}

/**
 * Asks before deleting an album with songs only it holds, and whether they go
 * too; songs on another album stay either way. The name and count come as
 * parameters, so the sheet stays as it was while it closes over the deleted
 * album.
 */
export default function DeleteAlbumScreen() {
  const id = useIdParam();
  const { name, songs } = useLocalSearchParams<{
    name: string;
    songs: string;
  }>();
  const [withSongs, setWithSongs] = useState(true);
  const deleting = useRef(false);
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel="Cancel"
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      <View className="gap-4 px-4" style={{ paddingTop: CONTENT_TOP }}>
        <Text
          className="text-body text-foreground text-center"
          numberOfLines={3}
        >
          “{name}” will be deleted.
        </Text>
        <View
          className="flex-row items-center justify-between rounded-[25px] bg-white/10 px-4"
          style={{ minHeight: ROW_HEIGHT }}
        >
          <Text className="text-body text-foreground">
            {deleteSongsLabel(Number(songs))}
          </Text>
          <FormHost matchContents>
            <Toggle
              label={deleteSongsLabel(Number(songs))}
              isOn={withSongs}
              modifiers={[labelsHidden()]}
              onIsOnChange={setWithSongs}
            />
          </FormHost>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-12 items-center justify-center rounded-full bg-white/10 active:opacity-70"
          onPress={() => {
            if (deleting.current) return;
            deleting.current = true;
            if (removeAlbum(id, { withSongs })) router.back();
            else deleting.current = false;
          }}
        >
          <Text className="text-body text-destructive font-semibold">
            Delete Album
          </Text>
        </Pressable>
      </View>
    </>
  );
}
