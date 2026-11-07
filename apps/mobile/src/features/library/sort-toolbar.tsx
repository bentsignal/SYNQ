import { Stack } from "expo-router";

import type { Sort, SortStore } from "./sort";
import { sortMenuItems } from "./sort-menu";

/**
 * A library list's toolbar: a `plus` button when the list can make new ones
 * (`add`), then the `arrow.up.arrow.down` sort menu. The menu goes last so
 * `plus` sits where it does on an album or playlist page, beside `ellipsis`.
 */
export function SortToolbar<Key extends string>({
  store,
  sort,
  add,
}: {
  store: SortStore<Key>;
  sort: Sort<Key>;
  add?: { label: string; onPress: () => void };
}) {
  return (
    <Stack.Toolbar placement="right">
      {add !== undefined && (
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel={add.label}
          onPress={add.onPress}
        />
      )}
      <Stack.Toolbar.Menu icon="arrow.up.arrow.down" accessibilityLabel="Sort">
        {sortMenuItems({ sort, store })}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
