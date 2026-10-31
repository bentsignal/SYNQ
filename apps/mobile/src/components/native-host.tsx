import type { ComponentProps } from "react";
import { Host } from "@expo/ui";
import { useCSSVariable } from "uniwind";

/**
 * `@expo/ui` Host, always dark (SYNQ is), tinted with the person's accent,
 * so SwiftUI controls match the Uniwind theme.
 */
export function NativeHost(props: ComponentProps<typeof Host>) {
  const accent = useCSSVariable("--color-accent");
  return (
    <Host
      colorScheme="dark"
      seedColor={typeof accent === "string" ? accent : undefined}
      {...props}
    />
  );
}

/** A theme color for SwiftUI modifiers, which take plain color strings. */
export function useNativeColor(
  name:
    | "--color-accent"
    | "--color-background"
    | "--color-fill"
    | "--color-muted"
    | "--color-separator",
) {
  const value = useCSSVariable(name);
  return typeof value === "string" ? value : undefined;
}
