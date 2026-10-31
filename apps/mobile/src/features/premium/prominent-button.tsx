import { Button, Text } from "@expo/ui";
import { ProgressView, ZStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
  opacity,
  tint,
} from "@expo/ui/swift-ui/modifiers";

import { FormHost } from "~/features/settings/form";

const FILL = [frame({ maxWidth: Infinity })];
const LABEL = { fontSize: 17, fontWeight: "600", textAlign: "center" } as const;

/**
 * A full-width Liquid Glass button in the accent, for a screen's one
 * action. While `loading`, a spinner takes the label's place (the label
 * stays, invisible, so the button keeps its size) and taps do nothing.
 */
export function ProminentButton({
  label,
  onPress,
  disabled,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <FormHost matchContents={{ vertical: true }}>
      <Button
        onPress={() => {
          if (!loading) onPress();
        }}
        disabled={disabled}
        modifiers={[
          buttonStyle("glassProminent"),
          buttonBorderShape("capsule"),
          controlSize("large"),
        ]}
      >
        <ZStack modifiers={FILL}>
          <Text
            modifiers={[...FILL, opacity(loading ? 0 : 1)]}
            textStyle={LABEL}
          >
            {label}
          </Text>
          {loading && <ProgressView modifiers={[tint("white")]} />}
        </ZStack>
      </Button>
    </FormHost>
  );
}
