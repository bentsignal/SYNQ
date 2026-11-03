// Reassure measurements: how long React takes to render the mini player,
// which sits on every screen, and how many renders it takes, compared with
// the PR's base in CI (`pnpm perf`; see README.md). Timings in Jest are
// React's work only, not drawing, so they flag regressions rather than
// measure frames. Add scenarios here as screens land (the library lists,
// the queue, search results).
import { QueryClientProvider } from "@tanstack/react-query";
import { measureRenders } from "reassure";

import { MiniPlayer } from "~/features/player/mini-player";
import { PLAYER_SONGS_QUERY } from "~/features/player/songs";
import { queryClient } from "~/lib/query-client";

test("the mini player renders", async () => {
  // The queue's songs are a library query; an empty player has none.
  queryClient.setQueryData(PLAYER_SONGS_QUERY, new Map());
  await measureRenders(
    <QueryClientProvider client={queryClient}>
      <MiniPlayer />
    </QueryClientProvider>,
  );
});
