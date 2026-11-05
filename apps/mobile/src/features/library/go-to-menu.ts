import type { MenuAction, MenuSubmenu } from "~/components/menu";
import { openLibraryScreen } from "./links";

const KINDS = {
  album: { icon: "square.stack", noun: "Album" },
  artist: { icon: "music.microphone", noun: "Artist" },
} as const;

/**
 * Go to Album or Go to Artist for one, or a Go to Artists submenu listing
 * each by name for several (docs/ui.md → Song menu).
 */
export function goToMenu(
  kind: keyof typeof KINDS,
  targets: readonly { id: number; name: string }[],
) {
  const { icon, noun } = KINDS[kind];
  const [only] = targets;
  if (only === undefined) return [];
  if (targets.length === 1) {
    return [
      {
        icon,
        key: kind,
        label: `Go to ${noun}`,
        onPress: () => openLibraryScreen({ id: only.id, screen: kind }),
      } satisfies MenuAction,
    ];
  }
  return [
    {
      icon,
      items: targets.map(
        (target) =>
          ({
            icon,
            key: `${kind}-${target.id}`,
            label: target.name,
            onPress: () => openLibraryScreen({ id: target.id, screen: kind }),
          }) satisfies MenuAction,
      ),
      key: `${kind}s`,
      label: `Go to ${noun}s`,
    } satisfies MenuSubmenu,
  ];
}
