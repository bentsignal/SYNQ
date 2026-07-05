import { Text } from "react-native";
import { formatDurationMs } from "../../services/duration-format-service";
import type { SongRowTheme } from "./SongRowTheme";

export function SongRowDuration({
  duration,
  theme,
}: {
  duration: number | null | undefined;
  theme: SongRowTheme;
}) {
  return (
    <Text
      className="min-w-11 text-right text-[13px] font-extrabold"
      style={{ color: theme.primaryText }}
    >
      {formatDurationMs(duration)}
    </Text>
  );
}

