import { Link } from "expo-router";
import { View } from "react-native";
import { useCustomizationTheme } from "@/src/features/settings/hooks/use-customization-theme";
import type { PlaybackPlayerLink } from "../services/playback-player-state-service";
import type { PlaybackQueueLink } from "../services/playback-screen-state-service";

type PlaybackPlayerLinksProps = {
  detailLink: PlaybackPlayerLink | null;
  editLink: PlaybackPlayerLink | null;
  queueLink: PlaybackQueueLink;
};

export function PlaybackPlayerLinks({
  detailLink,
  editLink,
  queueLink,
}: PlaybackPlayerLinksProps) {
  const theme = useCustomizationTheme();
  const links = [detailLink, editLink, queueLink].filter(
    (link): link is PlaybackPlayerLink | PlaybackQueueLink => Boolean(link),
  );

  return (
    <View className="gap-3">
      {links.map((link) => (
        <Link
          className="text-[15px] font-extrabold"
          href={link.href}
          key={`${link.href}:${link.label}`}
          style={{ color: theme.accent }}
        >
          {link.label}
        </Link>
      ))}
    </View>
  );
}
