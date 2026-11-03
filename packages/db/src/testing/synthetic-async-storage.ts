import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { NFD_FILE_NAME } from "./synthetic-constants.ts";

export function writeAsyncStorage(
  dir: string,
  documents: string,
  ids: { s1: number; s2: number; s6: number; s10: number; s12: number },
) {
  const documentsUri = `file://${documents}/`;
  function track(id: number, title: string, file: string) {
    return {
      id,
      url: `${documentsUri}library/${id}/${file}`,
      description: createHash("md5").update(`${id}`).digest("hex"),
      title,
      artist: "",
      album: "",
      artwork: `${documentsUri}albums/1/cover_full.jpg?1700000003`,
    };
  }
  const queue = [
    track(ids.s1, "See You Again", "01 See You Again.mp3"),
    track(ids.s2, "After the Storm", "After the Storm #2 & more.m4a"),
    {
      id: -2,
      url: "file:///bundle/ad.mp3",
      title: "Premium Ad",
      artist: "SYNQ",
      artwork: 1,
    },
    track(ids.s6, "Café del Mar", NFD_FILE_NAME), // index 3: the current track
    track(99, "Long Gone", "gone.mp3"),
    track(9, "Broken Import", "song.audio/mpeg"),
    track(ids.s12, "夜に駆ける", "夜に駆ける.mp3"),
    track(ids.s10, "Half Imported", "half.mp3"),
  ];
  const queueJson = JSON.stringify(queue);
  if (queueJson.length <= 1024)
    throw new Error(
      "fixture queue must exceed AsyncStorage's inline threshold",
    );

  const manifest = {
    dbVersion: "2",
    theme: "#A888EC",
    haptic: "false",
    shuffle: "true",
    loop: "true",
    queue: null,
    lastTrackIndex: "3",
    position: "42.7",
    sourceType: "1",
    sourceId: "3",
    expiration: "never",
    playAd: "true",
    timePlayed: "455",
    addOffset: "1",
    importCount: "4",
    reviewAlreadyRequested: "true",
    exportNumber: "2",
    somethingNew: "x",
  };
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest));
  writeFileSync(
    join(dir, createHash("md5").update("queue", "utf8").digest("hex")),
    queueJson,
  );
}
