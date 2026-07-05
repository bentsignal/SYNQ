import { Text, View } from "react-native";
import type {
  PlaybackQueueControllerViewState,
} from "../services/playback-queue-screen-state-service";

type PlaybackQueueHeaderProps = {
  accentColor: string;
  header: PlaybackQueueControllerViewState["screenState"]["header"];
  primaryTextColor: string;
  secondaryTextColor: string;
};

export function PlaybackQueueHeader({
  accentColor,
  header,
  primaryTextColor,
  secondaryTextColor,
}: PlaybackQueueHeaderProps) {
  return (
    <View className="gap-2">
      <Text
        className="text-[13px] font-extrabold uppercase"
        style={{ color: accentColor }}
      >
        {header.kicker}
      </Text>
      <Text
        className="text-[34px] font-extrabold leading-10"
        style={{ color: primaryTextColor }}
      >
        {header.title}
      </Text>
      <Text
        className="max-w-[520px] text-[15px] leading-[22px]"
        style={{ color: secondaryTextColor }}
      >
        {header.subtitle}
      </Text>
    </View>
  );
}
