import { Stack } from "expo-router";

import type { Sort, SortStore } from "./sort";

/**
 * A menu item's key, which changes when it's checked or unchecked, so the
 * check mark redraws (Vera's `checkedKey`).
 */
function checkedKey(value: string, checked: boolean) {
  return `${value}:${checked ? "on" : "off"}`;
}

const ORDERS = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
] as const;

/**
 * A list's sort choices for a `Stack.Toolbar.Menu`: the keys as one
 * checked group, then Ascending and Descending. `submenu` nests them under
 * "Sort By" (a playlist's `ellipsis` menu). A plain function, not a
 * component: a toolbar menu's items must be its direct children.
 */
export function sortMenuItems<Key extends string>({
  store,
  sort,
  id,
  submenu = false,
}: {
  store: SortStore<Key>;
  sort: Sort<Key>;
  /** A playlist keeps its own sort. */
  id?: number;
  submenu?: boolean;
}) {
  return (
    <Stack.Toolbar.Menu
      inline={!submenu}
      title={submenu ? "Sort By" : undefined}
      icon={submenu ? "arrow.up.arrow.down" : undefined}
    >
      <Stack.Toolbar.Menu inline>
        {store.keys.map((option) => (
          <Stack.Toolbar.MenuAction
            key={checkedKey(option.value, sort.key === option.value)}
            isOn={sort.key === option.value}
            onPress={() => store.set({ ...sort, key: option.value }, id)}
          >
            {option.label}
          </Stack.Toolbar.MenuAction>
        ))}
      </Stack.Toolbar.Menu>
      <Stack.Toolbar.Menu inline>
        {ORDERS.map((order) => (
          <Stack.Toolbar.MenuAction
            key={checkedKey(order.value, sort.order === order.value)}
            isOn={sort.order === order.value}
            onPress={() => store.set({ ...sort, order: order.value }, id)}
          >
            {order.label}
          </Stack.Toolbar.MenuAction>
        ))}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar.Menu>
  );
}

/**
 * A library list's toolbar: the `arrow.up.arrow.down` sort menu, and a
 * `plus` button when the list can make new ones (`add`).
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
      <Stack.Toolbar.Menu icon="arrow.up.arrow.down" accessibilityLabel="Sort">
        {sortMenuItems({ sort, store })}
      </Stack.Toolbar.Menu>
      {add !== undefined && (
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel={add.label}
          onPress={add.onPress}
        />
      )}
    </Stack.Toolbar>
  );
}
