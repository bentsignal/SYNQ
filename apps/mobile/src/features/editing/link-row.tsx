import { ListItem, Text } from "@expo/ui";
import { HStack, Image, Text as SwiftText } from "@expo/ui/swift-ui";
import { foregroundStyle, lineLimit } from "@expo/ui/swift-ui/modifiers";

import { useNativeColor } from "~/components/native-host";

/**
 * A form row that opens a list in the sheet (Reorder Songs, Artists): its
 * label, what it holds now in gray, and a chevron.
 */
export function LinkRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  const muted = useNativeColor("--color-muted");
  return (
    <ListItem
      trailing={
        <HStack spacing={8}>
          {value !== undefined && (
            <SwiftText
              modifiers={[
                lineLimit(1),
                foregroundStyle({ style: "secondary", type: "hierarchical" }),
              ]}
            >
              {value}
            </SwiftText>
          )}
          <Image systemName="chevron.right" size={13} color={muted ?? "gray"} />
        </HStack>
      }
      onPress={onPress}
    >
      <Text>{label}</Text>
    </ListItem>
  );
}
