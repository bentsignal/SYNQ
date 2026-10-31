// Reassure measurements: how long React takes to render the mini player,
// which sits on every screen, and how many renders it takes, compared with
// the PR's base in CI (`pnpm perf`; see README.md). Timings in Jest are
// React's work only, not drawing, so they flag regressions rather than
// measure frames. Add scenarios here as screens land (the library lists,
// the queue, search results).
import { measureRenders } from "reassure";

import { MiniPlayer } from "~/features/player/mini-player";

test("the mini player renders", async () => {
  await measureRenders(<MiniPlayer />);
});
