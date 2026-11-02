import assert from "node:assert/strict";
import { test } from "node:test";

import { emptyAlbumPrompt } from "./empty-album-prompt.ts";

void test("names one album", () => {
  assert.deepEqual(emptyAlbumPrompt(["Kestrel"]), {
    message: "“Kestrel” has no songs left.",
    title: "Delete Empty Album?",
  });
});

void test("names two or three", () => {
  assert.deepEqual(emptyAlbumPrompt(["A", "B"]), {
    message: "“A” and “B” have no songs left.",
    title: "Delete 2 Empty Albums?",
  });
  assert.equal(
    emptyAlbumPrompt(["A", "B", "C"]).message,
    "“A”, “B”, and “C” have no songs left.",
  );
});

void test("counts the rest of a long list", () => {
  assert.deepEqual(emptyAlbumPrompt(["A", "B", "C", "D", "E"]), {
    message: "“A”, “B”, “C”, and 2 more have no songs left.",
    title: "Delete 5 Empty Albums?",
  });
});
