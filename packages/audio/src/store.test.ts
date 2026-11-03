import assert from "node:assert/strict";
import { test } from "node:test";

import type { SnapshotSource } from "./store.ts";
import { createSnapshotStore } from "./store.ts";

function fakeSource(readValue: number) {
  let emit: ((value: number) => void) | undefined;
  let listens = 0;
  let stops = 0;
  let resolveRead: ((value: number) => void) | undefined;
  const source = {
    listen(set) {
      listens += 1;
      emit = set;
      return () => {
        stops += 1;
        emit = undefined;
      };
    },
    read: () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  } satisfies SnapshotSource<number>;
  return {
    source,
    emit: (value: number) => emit?.(value),
    resolveRead: () => resolveRead?.(readValue),
    counts: () => ({ listens, stops }),
  };
}

function tick() {
  return new Promise((resolve) => setImmediate(resolve));
}

void test("listens only while subscribed", () => {
  const fake = fakeSource(1);
  const store = createSnapshotStore(fake.source, 0);
  assert.deepEqual(fake.counts(), { listens: 0, stops: 0 });
  const a = store.subscribe(() => undefined);
  const b = store.subscribe(() => undefined);
  assert.deepEqual(fake.counts(), { listens: 1, stops: 0 });
  a();
  assert.deepEqual(fake.counts(), { listens: 1, stops: 0 });
  b();
  assert.deepEqual(fake.counts(), { listens: 1, stops: 1 });
  store.subscribe(() => undefined);
  assert.deepEqual(fake.counts(), { listens: 2, stops: 1 });
});

void test("takes the initial read, then events", async () => {
  const fake = fakeSource(7);
  const store = createSnapshotStore(fake.source, 0);
  let notified = 0;
  store.subscribe(() => {
    notified += 1;
  });
  assert.equal(store.getSnapshot(), 0);
  fake.resolveRead();
  await tick();
  assert.equal(store.getSnapshot(), 7);
  fake.emit(8);
  assert.equal(store.getSnapshot(), 8);
  assert.equal(notified, 2);
});

void test("an event newer than the initial read wins", async () => {
  const fake = fakeSource(7);
  const store = createSnapshotStore(fake.source, 0);
  store.subscribe(() => undefined);
  fake.emit(9);
  fake.resolveRead();
  await tick();
  assert.equal(store.getSnapshot(), 9);
});

void test("a read that lands after unsubscribing is ignored", async () => {
  const fake = fakeSource(7);
  const store = createSnapshotStore(fake.source, 0);
  const unsubscribe = store.subscribe(() => undefined);
  unsubscribe();
  fake.resolveRead();
  await tick();
  assert.equal(store.getSnapshot(), 0);
});
