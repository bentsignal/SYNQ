import { View } from "react-native";
import { Image } from "expo-image";
import { launchImageLibraryAsync } from "expo-image-picker";
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
import { failed } from "~/features/library/actions";

const SIZE = 160;

/** Picks a photo, cropped square by the system's editor. */
async function pickPhoto() {
  const result = await launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ["images"],
    quality: 1,
  });
  const [asset] = result.canceled ? [] : result.assets;
  if (asset === undefined) return null;
  return {
    kind: "picked",
    uri: asset.uri,
    width: Math.min(asset.width, asset.height),
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
 * and Choose Photo (the photo library, cropped square), with Remove Photo
 * when there's one to remove. Goes first in a `FieldGroup`.
 */
export function ArtworkField({
  artwork,
  change,
  placeholder,
  onChange,
}: {
  /** The saved artwork. */
  artwork: ArtworkRef | null;
  change: ArtworkChange;
  placeholder: ArtworkPlaceholder;
  onChange: (change: ArtworkChange) => void;
}) {
  const hasArtwork =
    change.kind === "picked" || (change.kind === "keep" && artwork !== null);
  function choose() {
    void pickPhoto().then(
      (picked) => picked !== null && onChange(picked),
      () => failed("Couldn't Open Photos"),
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
      {hasArtwork ? (
        <Menu label="Edit Artwork" modifiers={[buttonStyle("borderless")]}>
          <Button
            label="Choose Photo"
            systemImage="photo.on.rectangle"
            onPress={choose}
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
          onPress={choose}
        />
      )}
    </VStack>
  );
}
