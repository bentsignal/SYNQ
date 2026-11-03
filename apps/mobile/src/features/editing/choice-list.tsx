import { Stack } from "expo-router";
import {
  Button,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  listStyle,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { matchesSearch } from "@synq/db";

import type { Pick } from "./pick";
import { NativeHost, useNativeColor } from "~/components/native-host";
import { useSearchText } from "~/features/search/use-search-query";
import { pickKey } from "./pick";

function ChoiceRow({
  label,
  detail,
  checked,
  onPress,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onPress: () => void;
}) {
  const accent = useNativeColor("--color-accent");
  return (
    <Button modifiers={[buttonStyle("plain")]} onPress={onPress}>
      {/* The whole row takes the tap, not just the name. */}
      <HStack
        modifiers={[
          frame({ maxWidth: Infinity }),
          contentShape(shapes.rectangle()),
        ]}
      >
        <Text modifiers={[lineLimit(1)]}>{label}</Text>
        {detail !== undefined && (
          <Text
            modifiers={[
              lineLimit(1),
              font({ size: 15 }),
              foregroundStyle({ style: "secondary", type: "hierarchical" }),
            ]}
          >
            {detail}
          </Text>
        )}
        <Spacer />
        {checked && (
          <Image systemName="checkmark" size={15} color={accent ?? "white"} />
        )}
      </HStack>
    </Button>
  );
}

/**
 * Picks artists or albums for an edit sheet: the chosen ones first, in
 * credit order (the first album is the song's primary one), then every
 * other, filtered by the bar's search field. Typing a name that isn't
 * there offers it as a new one; `canAddNamed` can offer one that is, for
 * albums, where two can share a name.
 */
export function ChoiceList({
  noun,
  options,
  picked,
  canAddNamed,
  onChange,
}: {
  /** "Artist" or "Album", for the search field and the New row. */
  noun: string;
  options: readonly { id: number; name: string; detail?: string }[];
  picked: readonly Pick[];
  canAddNamed?: (name: string) => boolean;
  onChange: (picked: Pick[]) => void;
}) {
  const search = useSearchText();
  const typed = search.query.trim();
  const pickedKeys = new Set(picked.map(pickKey));
  const others = options.filter(
    (option) =>
      !pickedKeys.has(pickKey(option)) && matchesSearch(typed, [option.name]),
  );
  function sameName(option: { name: string }) {
    return option.name.toLowerCase() === typed.toLowerCase();
  }
  const exists =
    typed === "" ||
    picked.some((pick) => !("id" in pick) && sameName(pick)) ||
    (canAddNamed === undefined
      ? [...options, ...picked].some(sameName)
      : !canAddNamed(typed));
  function detailOf(pick: Pick) {
    return "id" in pick
      ? options.find((option) => option.id === pick.id)?.detail
      : "New";
  }
  return (
    <>
      <Stack.SearchBar
        placeholder={`Search or Add ${noun}`}
        onChangeText={(event) => search.onChangeText(event.nativeEvent.text)}
        onCancelButtonPress={search.clear}
      />
      <NativeHost style={{ flex: 1 }}>
        <List modifiers={[listStyle("insetGrouped")]}>
          {!exists && (
            <Section>
              <Button
                label={`New ${noun} “${typed}”`}
                systemImage="plus.circle.fill"
                onPress={() => onChange([...picked, { name: typed }])}
              />
            </Section>
          )}
          {picked.length > 0 && (
            <Section title="Chosen">
              {picked.map((pick) => (
                <ChoiceRow
                  key={pickKey(pick)}
                  label={pick.name}
                  detail={detailOf(pick)}
                  checked
                  onPress={() =>
                    onChange(
                      picked.filter(
                        (other) => pickKey(other) !== pickKey(pick),
                      ),
                    )
                  }
                />
              ))}
            </Section>
          )}
          {others.length > 0 && (
            <Section title={`All ${noun}s`}>
              {others.map((option) => (
                <ChoiceRow
                  key={option.id}
                  label={option.name}
                  detail={option.detail}
                  checked={false}
                  onPress={() =>
                    onChange([...picked, { id: option.id, name: option.name }])
                  }
                />
              ))}
            </Section>
          )}
        </List>
      </NativeHost>
    </>
  );
}
