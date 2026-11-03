import assert from "node:assert/strict";
import { test } from "node:test";

import type { MenuGroups } from "./menu.ts";
import { menuAction, menuJson } from "./menu.ts";

function noop() {
  return undefined;
}

const next = {
  icon: "text.insert",
  key: "next",
  label: "Play Next",
  onPress: noop,
} as const;
const mara = {
  icon: "music.microphone",
  key: "a1",
  label: "Mara",
  onPress: noop,
} as const;
const lind = {
  icon: "music.microphone",
  key: "a2",
  label: "Lind",
  onPress: noop,
} as const;
const remove = {
  destructive: true,
  icon: "trash",
  key: "delete",
  label: "Delete from Library",
  onPress: noop,
} as const;

const MENU = [
  [next],
  [
    {
      icon: "music.microphone",
      items: [mara, lind],
      key: "artists",
      label: "Go to Artist",
    },
  ],
  [remove],
] satisfies MenuGroups;

void test("sends a menu as groups of items with their place as the id", () => {
  assert.deepEqual(JSON.parse(menuJson(MENU)), [
    [{ id: "0.0", image: "text.insert", title: "Play Next" }],
    [
      {
        children: [
          { id: "1.0.0", image: "music.microphone", title: "Mara" },
          { id: "1.0.1", image: "music.microphone", title: "Lind" },
        ],
        id: "1.0",
        image: "music.microphone",
        title: "Go to Artist",
      },
    ],
    [
      {
        destructive: true,
        id: "2.0",
        image: "trash",
        title: "Delete from Library",
      },
    ],
  ]);
});

void test("finds the chosen action by its id", () => {
  assert.equal(menuAction(MENU, "0.0"), next);
  assert.equal(menuAction(MENU, "1.0.1"), lind);
  assert.equal(menuAction(MENU, "2.0"), remove);
});

void test("finds nothing for a submenu or an id it didn't give", () => {
  assert.equal(menuAction(MENU, "1.0"), undefined);
  assert.equal(menuAction(MENU, "0.0.0"), undefined);
  assert.equal(menuAction(MENU, "3.0"), undefined);
  assert.equal(menuAction(MENU, ""), undefined);
});
