import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { displayAddress, liveMessage, wantsServer } from "./transfer-link.ts";

void describe("wantsServer", () => {
  void test("never starts before someone opens Wi-Fi Transfer", () => {
    assert.equal(
      wantsServer({ hasLiveLink: true, on: false, used: false }),
      false,
    );
  });

  void test("stays up, switch or not, once used", () => {
    assert.equal(
      wantsServer({ hasLiveLink: true, on: false, used: true }),
      true,
    );
    assert.equal(
      wantsServer({ hasLiveLink: true, on: true, used: true }),
      true,
    );
  });

  void test("an older binary's server, which can't refuse, runs only while on", () => {
    assert.equal(
      wantsServer({ hasLiveLink: false, on: false, used: true }),
      false,
    );
    assert.equal(
      wantsServer({ hasLiveLink: false, on: true, used: true }),
      true,
    );
  });
});

void describe("the address", () => {
  void test("leaves out port 80", () => {
    assert.equal(displayAddress("10.0.0.2", 80), "10.0.0.2");
    assert.equal(displayAddress("10.0.0.2", 3000), "10.0.0.2:3000");
  });
});

void describe("liveMessage", () => {
  void test("is the JSON the page reads", () => {
    assert.deepEqual(
      JSON.parse(
        liveMessage({
          accent: "#77adf8",
          imported: 3,
          importing: true,
          on: true,
        }),
      ),
      { accent: "#77adf8", imported: 3, importing: true, on: true },
    );
  });
});
