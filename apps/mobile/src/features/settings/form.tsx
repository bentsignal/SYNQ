import type { SymbolViewProps } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { FieldGroup, Host, ListItem, Text } from "@expo/ui";
import { scrollContentBackground } from "@expo/ui/swift-ui/modifiers";
import { useCSSVariable } from "uniwind";

import { SymbolIcon } from "~/components/symbol-icon";

/** iOS's secondary label gray, for `@expo/ui` text that takes a color. */
export const SECONDARY_LABEL = "#8E8E93";

/**
 * A SwiftUI host in SYNQ's dark appearance, tinted with the accent, so
 * native controls match the theme.
 */
export function FormHost(props: ComponentProps<typeof Host>) {
  const accent = useCSSVariable("--color-accent");
  return (
    <Host
      seedColor={typeof accent === "string" ? accent : undefined}
      colorScheme="dark"
      {...props}
    />
  );
}

/**
 * A grouped native form on the app's background (SwiftUI's own is pure
 * black), filling its screen.
 */
export function Form({ children }: { children: ReactNode }) {
  return (
    <FormHost style={{ flex: 1 }} className="bg-background">
      <FieldGroup modifiers={[scrollContentBackground("hidden")]}>
        {children}
      </FieldGroup>
    </FormHost>
  );
}

function Chevron() {
  return (
    <SymbolIcon
      name="chevron.right"
      size={13}
      weight="semibold"
      tintColorClassName="accent-subtle"
    />
  );
}

/**
 * A form row: an accent symbol, its label, an optional detail, and (when
 * it opens something) a chevron or an outward arrow.
 */
export function Row({
  icon,
  label,
  detail,
  trailing = "chevron",
  onPress,
}: {
  icon: SymbolViewProps["name"];
  label: string;
  detail?: string;
  trailing?: "chevron" | "external" | "none";
  onPress?: () => void;
}) {
  return (
    <ListItem
      leading={
        <SymbolIcon name={icon} size={19} tintColorClassName="accent-accent" />
      }
      trailing={
        trailing === "chevron" ? (
          <Chevron />
        ) : trailing === "external" ? (
          <SymbolIcon
            name="arrow.up.right"
            size={12}
            weight="semibold"
            tintColorClassName="accent-subtle"
          />
        ) : undefined
      }
      supportingText={detail}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </ListItem>
  );
}
