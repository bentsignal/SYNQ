const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const {
  alternateIconSettings,
  iconName,
} = require("./with-alternate-icons.cjs");

const APP = path.join(__dirname, "..");

/**
 * 2.5.2's alternate icon names. iOS stores the person's choice by name, so
 * an icon renamed here would silently reset everyone who picked it.
 */
const LEGACY_NAMES = [
  "icon-blue",
  "icon-mint",
  "icon-red",
  "icon-yellow",
  "icon-purple",
  "icon-orange",
  "icon-pink",
];

test("the app config registers exactly 2.5.2's alternate icon names", () => {
  const config = fs.readFileSync(path.join(APP, "app.config.ts"), "utf8");
  const list = /const ALTERNATE_ICONS = \[([\s\S]*?)\]/.exec(config)?.[1];
  assert.ok(list !== undefined);
  const names = [...list.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(names, LEGACY_NAMES);
});

test("every icon is an Icon Composer document with both arrows", () => {
  for (const name of [...LEGACY_NAMES, "synq", "synq-dev"]) {
    const bundle = path.join(APP, `assets/icons/${name}.icon`);
    const document = JSON.parse(
      fs.readFileSync(path.join(bundle, "icon.json"), "utf8"),
    );
    assert.equal(document.groups.length, 2, name);
    for (const group of document.groups) {
      const [layer] = group.layers;
      assert.ok(
        fs.existsSync(path.join(bundle, "Assets", layer["image-name"])),
      );
    }
  }
});

test("the primary icon is the blue one", () => {
  const read = (name) =>
    fs.readFileSync(path.join(APP, `assets/icons/${name}.icon/icon.json`));
  assert.ok(read("synq").equals(read("icon-blue")));
});

test("an icon's name is its file name without .icon", () => {
  assert.equal(iconName("./assets/icons/icon-blue.icon"), "icon-blue");
});

test("the build settings list every icon by name", () => {
  const settings = alternateIconSettings(
    LEGACY_NAMES.map((name) => `./assets/icons/${name}.icon`),
  );
  assert.equal(
    settings.ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES,
    `"${LEGACY_NAMES.join(" ")}"`,
  );
  assert.equal(
    settings.ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS,
    "YES",
  );
});
