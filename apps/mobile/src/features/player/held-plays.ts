/** Nothing's been scrolled yet. */
function beforeTheTabOpens() {
  return true;
}

/**
 * When a play reaches Recents (docs/rewrite.md → Home). Recents only changes if
 * the Library tab was at the very top when it was left, so what's played waits
 * while the tab is on screen, and for as long as it was left scrolled down.
 * Going to the background saves what's waiting, in case the app doesn't come
 * back, but a list left scrolled down still doesn't change.
 */
export function createHeldPlays<Item>({
  show,
  write,
}: {
  /** Puts what's been written on screen. */
  show: () => void;
  write: (plays: readonly { item: Item; at: number }[]) => void;
}) {
  let onScreen = false;
  let atTop = beforeTheTabOpens;
  let waiting = new Array<{ item: Item; at: number }>();
  let unseen = false;
  function save() {
    if (waiting.length === 0) return;
    const plays = waiting;
    waiting = [];
    write(plays);
    unseen = true;
  }
  function apply() {
    save();
    if (!unseen) return;
    unseen = false;
    show();
  }
  return {
    /** The tab came on screen; `isAtTop` says whether its list is at the very top. */
    arrive(isAtTop: () => boolean) {
      onScreen = true;
      atTop = isAtTop;
    },
    /** The app went to the background. */
    background() {
      if (atTop()) apply();
      else save();
    },
    /** The tab went off screen: another tab, a pushed page, the player. */
    leave() {
      onScreen = false;
      if (atTop()) apply();
    },
    record(item: Item, at: number) {
      waiting.push({ at, item });
      if (!onScreen && atTop()) apply();
    },
  };
}
