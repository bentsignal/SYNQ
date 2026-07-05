import { Link } from "expo-router";
import type { PlaybackQueueControllerViewState } from "../services/playback-queue-screen-state-service";

type PlaybackQueueBackLinkProps = {
  accentColor: string;
  backLink: PlaybackQueueControllerViewState["screenState"]["backLink"];
};

export function PlaybackQueueBackLink({
  accentColor,
  backLink,
}: PlaybackQueueBackLinkProps) {
  return (
    <Link
      className="text-[15px] font-extrabold"
      href={backLink.href}
      style={{ color: accentColor }}
    >
      {backLink.label}
    </Link>
  );
}
