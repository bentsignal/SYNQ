import type { TextInputProps } from "@expo/ui";
import { TextInput as UITextInput } from "@expo/ui";
import { useCSSVariable } from "uniwind";

/** `@expo/ui`'s text field with the theme's muted placeholder (Vera's). */
export function TextInput(props: TextInputProps) {
  const muted = useCSSVariable("--color-muted");
  return (
    <UITextInput
      placeholderTextColor={typeof muted === "string" ? muted : undefined}
      {...props}
    />
  );
}
