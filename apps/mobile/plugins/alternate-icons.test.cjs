const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const {
  alternateIconSettings,
  iconName,
  iconSetContents,
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

test("every alternate icon is a 1024 px PNG in assets/icons", () => {
  for (const name of [...LEGACY_NAMES, "synq-dev"]) {
    const file = fs.readFileSync(path.join(APP, `assets/icons/${name}.png`));
    // PNG signature, then the IHDR chunk's width and height.
    assert.equal(file.toString("hex", 0, 8), "89504e470d0a1a0a");
    assert.equal(file.readUInt32BE(16), 1024, `${name} width`);
    assert.equal(file.readUInt32BE(20), 1024, `${name} height`);
  }
});

test("an icon's name is its file name without .png", () => {
  assert.equal(iconName("./assets/icons/icon-blue.png"), "icon-blue");
});

test("the build settings list every icon by name", () => {
  const settings = alternateIconSettings(
    LEGACY_NAMES.map((name) => `./assets/icons/${name}.png`),
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

test("each icon set holds one universal 1024 px image", () => {
  assert.deepEqual(iconSetContents("icon-mint.png").images, [
    {
      filename: "icon-mint.png",
      idiom: "universal",
      platform: "ios",
      size: "1024x1024",
    },
  ]);
});
