import type { SymbolViewProps } from "expo-symbols";
import type { ComponentProps, ReactNode } from "react";
import { useRef, useState } from "react";
import { Stack } from "expo-router";
import { FieldGroup, Host, ListItem, Text } from "@expo/ui";
import {
  scrollContentBackground,
  scrollEdgeEffectStyle,
  useScrollGeometryChange,
} from "@expo/ui/swift-ui/modifiers";
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

/** Past the top by more than rounding, in points. */
const SCROLLED_PAST_TOP = 0.5;

/**
 * `Form` under `RootTabTitle`, with its glass bar: the screen's option doesn't
 * reach a SwiftUI scroll view, so the form asks for the same edge effect. In
 * SwiftUI `hard` draws even with nothing under the bar, unlike in UIKit, so the
 * bar wears the page's color until the form has scrolled. The style itself
 * stays put: changing it rebuilds the list, which jumps back to the top.
 */
export function RootTabForm({ children }: { children: ReactNode }) {
  const background = useCSSVariable("--color-background");
  const [scrolled, setScrolled] = useState(false);
  // Where the form rests under the bar: its first offset once it's laid out.
  const top = useRef<number | null>(null);
  const geometry = useScrollGeometryChange((scroll) => {
    if (scroll.containerHeight === 0) return;
    const resting = top.current ?? scroll.contentOffsetY;
    top.current = resting;
    const next = scroll.contentOffsetY > resting + SCROLLED_PAST_TOP;
    if (next !== scrolled) setScrolled(next);
  });
  return (
    <FormHost style={{ flex: 1 }} className="bg-background">
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor:
              scrolled || typeof background !== "string"
                ? "transparent"
                : background,
          },
        }}
      />
      <FieldGroup
        modifiers={[
          scrollContentBackground("hidden"),
          scrollEdgeEffectStyle("hard", "top"),
          ...(geometry === null ? [] : [geometry]),
        ]}
      >
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
