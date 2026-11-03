import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { isInsertionOnly } from "./list-order.ts";

function same(previous: string, next: string) {
  return isInsertionOnly([...previous], [...next], (item) => item);
}

void describe("isInsertionOnly", () => {
  void test("new items anywhere keep the order", () => {
    assert.equal(same("bcd", "abcd"), true);
    assert.equal(same("bd", "abcde"), true);
    assert.equal(same("abc", "abc"), true);
    assert.equal(same("", "abc"), true);
  });

  void test("a new sort isn't an insertion", () => {
    assert.equal(same("abc", "cba"), false);
    assert.equal(same("abc", "acbd"), false);
  });

  void test("a search or a delete isn't one either", () => {
    assert.equal(same("abc", "ac"), false);
    assert.equal(same("abc", "abd"), false);
  });
});
