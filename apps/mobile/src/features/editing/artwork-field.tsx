import { Alert, View } from "react-native";
import { Image } from "expo-image";
import { Button, Menu, RNHostView, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  frame,
  listRowBackground,
} from "@expo/ui/swift-ui/modifiers";

import type { ArtworkRef } from "@synq/db";

import type { ArtworkChange } from "./artwork-change";
import type { ArtworkPlaceholder } from "~/components/artwork";
import { Artwork } from "~/components/artwork";
import { afterMenuCloses } from "~/components/menu";
import { failed } from "~/features/library/actions";
import { synqMedia, synqMediaAvailable } from "~/features/media/native";

const SIZE = 160;

/**
 * Picks a photo and crops it square, natively (`SquarePhotoPicker.swift`): the
 * system's picker, then Move and Scale over it.
 */
async function pickPhoto() {
  if (!synqMediaAvailable()) return null;
  const photo = await synqMedia().pickSquarePhoto?.();
  if (photo === undefined || photo === null) return null;
  return {
    kind: "picked",
    uri: photo.uri,
    width: photo.width,
  } satisfies ArtworkChange;
}

function Preview({
  artwork,
  change,
  placeholder,
}: {
  artwork: ArtworkRef | null;
  change: ArtworkChange;
  placeholder: ArtworkPlaceholder;
}) {
  if (change.kind === "picked") {
    return (
      <Image
        source={{ uri: change.uri }}
        style={{ borderRadius: 10, height: SIZE, width: SIZE }}
        contentFit="cover"
        transition={150}
      />
    );
  }
  return (
    <Artwork
      artwork={change.kind === "removed" ? null : artwork}
      placeholder={placeholder}
      size={SIZE}
    />
  );
}

/**
 * The artwork at the top of an edit form: the cover as it will be saved,
 * and Choose Photo (the photo library, then Move and Scale), with Remove Photo
 * when there's one to remove. Goes first in a `FieldGroup`.
 *
 * On a song using its album's artwork, it asks first whether to change the
 * album's or only the song's, and offers no Remove: a cover that every song on
 * an album shows is removed from Edit Album, where that's plain.
 */
export function ArtworkField({
  artwork,
  change,
  placeholder,
  sharedWith,
  onChange,
}: {
  /** The saved artwork. */
  artwork: ArtworkRef | null;
  change: ArtworkChange;
  placeholder: ArtworkPlaceholder;
  /** A song using this album's artwork, and what to do with a photo just for it. */
  sharedWith?: {
    albumName: string;
    onChooseForSong: (change: ArtworkChange) => void;
  };
  onChange: (change: ArtworkChange) => void;
}) {
  const hasArtwork =
    change.kind === "picked" || (change.kind === "keep" && artwork !== null);
  function choose(onPicked = onChange) {
    void pickPhoto().then(
      (picked) => picked !== null && onPicked(picked),
      () => failed("Couldn't Open Photos"),
    );
  }
  function askWhose({
    albumName,
    onChooseForSong,
  }: NonNullable<typeof sharedWith>) {
    // The picker can't open until the alert has gone.
    Alert.alert(
      "Edit Album or Song Artwork?",
      `Album artwork changes every song on “${albumName}” that uses it.`,
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => afterMenuCloses(() => choose()),
          text: "Album Artwork",
        },
        {
          onPress: () => afterMenuCloses(() => choose(onChooseForSong)),
          text: "Song Artwork",
        },
      ],
    );
  }
  return (
    <VStack
      spacing={12}
      modifiers={[
        frame({ maxWidth: Infinity }),
        listRowBackground("#00000000"),
      ]}
    >
      <RNHostView matchContents>
        <View style={{ height: SIZE, width: SIZE }}>
          <Preview
            artwork={artwork}
            change={change}
            placeholder={placeholder}
          />
        </View>
      </RNHostView>
      {sharedWith !== undefined ? (
        <Button
          label={hasArtwork ? "Edit Artwork" : "Add Artwork"}
          modifiers={[buttonStyle("borderless")]}
          onPress={() => askWhose(sharedWith)}
        />
      ) : hasArtwork ? (
        <Menu label="Edit Artwork" modifiers={[buttonStyle("borderless")]}>
          <Button
            label="Choose Photo"
            systemImage="photo.on.rectangle"
            onPress={() => choose()}
          />
          <Button
            label="Remove Photo"
            systemImage="trash"
            role="destructive"
            onPress={() => onChange({ kind: "removed" })}
          />
        </Menu>
      ) : (
        <Button
          label="Add Artwork"
          modifiers={[buttonStyle("borderless")]}
          onPress={() => choose()}
        />
      )}
    </VStack>
  );
}
