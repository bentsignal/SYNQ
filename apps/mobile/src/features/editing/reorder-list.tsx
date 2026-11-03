import { View } from "react-native";
import {
  Button,
  HStack,
  List,
  RNHostView,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  deleteDisabled,
  environment,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";

import type { ArtworkRef } from "@synq/db";

import { Artwork } from "~/components/artwork";
import { NativeHost } from "~/components/native-host";

export interface ReorderRow {
  key: string;
  title: string;
  subtitle: string;
  artwork: ArtworkRef | null;
}

const ARTWORK_SIZE = 40;

/**
 * A native SwiftUI `List` in edit mode (docs/ui.md → Editing): drag the
 * handles to reorder, and, with `onDelete`, tap the red control or swipe
 * to remove, with an Add Songs row on top. An album's and a playlist's Edit
 * Songs. The parent keeps the order.
 */
export function ReorderList({
  rows,
  onMove,
  onDelete,
  onAdd,
}: {
  rows: readonly ReorderRow[];
  onMove: (from: number[], to: number) => void;
  onDelete?: (indices: number[]) => void;
  onAdd?: () => void;
}) {
  return (
    <NativeHost style={{ flex: 1 }}>
      <List modifiers={[listStyle("plain"), environment("editMode", "active")]}>
        {onAdd !== undefined && (
          <Button
            label="Add Songs"
            systemImage="plus.circle.fill"
            onPress={onAdd}
          />
        )}
        <List.ForEach onMove={onMove} onDelete={onDelete}>
          {rows.map((row) => (
            <HStack
              key={row.key}
              spacing={12}
              modifiers={onDelete === undefined ? [deleteDisabled(true)] : []}
            >
              <RNHostView matchContents>
                <View style={{ height: ARTWORK_SIZE, width: ARTWORK_SIZE }}>
                  <Artwork
                    artwork={row.artwork}
                    placeholder="song"
                    size={ARTWORK_SIZE}
                  />
                </View>
              </RNHostView>
              <VStack
                alignment="leading"
                spacing={2}
                modifiers={[
                  frame({ alignment: "leading", maxWidth: Infinity }),
                ]}
              >
                <Text modifiers={[lineLimit(1)]}>{row.title}</Text>
                <Text
                  modifiers={[
                    lineLimit(1),
                    font({ size: 15 }),
                    foregroundStyle({
                      style: "secondary",
                      type: "hierarchical",
                    }),
                  ]}
                >
                  {row.subtitle}
                </Text>
              </VStack>
            </HStack>
          ))}
        </List.ForEach>
      </List>
    </NativeHost>
  );
}
