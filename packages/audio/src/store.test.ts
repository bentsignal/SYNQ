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

function fakeGate(open: boolean) {
  let isOpen = open;
  let onChange: (() => void) | undefined;
  let watching = 0;
  return {
    gate: {
      isOpen: () => isOpen,
      watch(change: () => void) {
        watching += 1;
        onChange = change;
        return () => {
          watching -= 1;
          onChange = undefined;
        };
      },
    },
    set(next: boolean) {
      isOpen = next;
      onChange?.();
    },
    watching: () => watching,
  };
}

void test("a closed gate stops listening, and opening it listens and reads again", async () => {
  const fake = fakeSource(7);
  const gate = fakeGate(true);
  const store = createSnapshotStore(fake.source, 0, gate.gate);
  store.subscribe(() => undefined);
  assert.deepEqual(fake.counts(), { listens: 1, stops: 0 });
  gate.set(false);
  assert.deepEqual(fake.counts(), { listens: 1, stops: 1 });
  fake.emit(3);
  assert.equal(store.getSnapshot(), 0);
  gate.set(true);
  assert.deepEqual(fake.counts(), { listens: 2, stops: 1 });
  fake.resolveRead();
  await tick();
  assert.equal(store.getSnapshot(), 7);
});

void test("subscribing behind a closed gate waits for it to open", () => {
  const fake = fakeSource(7);
  const gate = fakeGate(false);
  const store = createSnapshotStore(fake.source, 0, gate.gate);
  const unsubscribe = store.subscribe(() => undefined);
  assert.deepEqual(fake.counts(), { listens: 0, stops: 0 });
  gate.set(true);
  assert.deepEqual(fake.counts(), { listens: 1, stops: 0 });
  unsubscribe();
  assert.equal(gate.watching(), 0);
  gate.set(false);
  gate.set(true);
  assert.deepEqual(fake.counts(), { listens: 1, stops: 1 });
});
