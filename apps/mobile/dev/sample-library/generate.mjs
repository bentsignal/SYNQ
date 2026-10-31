// Regenerates the dev sample library: short synthesized songs (real,
// playable AAC and MP3 with tags and, for album tracks, embedded artwork),
// gradient covers in 2.5.2's two sizes, and manifest.json, which
// `synqDev.seed()` reads (src/features/dev/seed.ts). Needs ffmpeg.
//
//   node apps/mobile/dev/sample-library/generate.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SECONDS = 10;

/** Covers: three gradient colors and a gradient type (ffmpeg `gradients`). */
const COVERS = {
  lowlight: ["0x1f3b73", "0xe0a3c4", "0x0d0d1a", 2, 4],
  "paper-moons": ["0xf2c879", "0x6b3f2a", "0x1c1410", 0, 11],
  northbound: ["0x6fb1a0", "0x14324a", "0xdfe8e4", 1, 7],
  "glass-garden": ["0x9b6bd6", "0x2a1840", "0xf5b8a6", 2, 21],
  "late-drives": ["0xff8f6b", "0x2b1d4a", "0x101018", 0, 3],
  "aurora-fields": ["0x77adf8", "0x101b33", "0xbfd9ff", 2, 9],
  kestrel: ["0xd9d4c7", "0x3d3a33", "0x8a6f4d", 1, 5],
};

// prettier-ignore
const SONGS = [
  // Aurora Fields · Lowlight (2021), album artwork
  ["Morning Static", "Aurora Fields", "Lowlight", 2021, 1, "m4a", 220, "major", "lowlight"],
  ["Lowlight", "Aurora Fields", "Lowlight", 2021, 2, "m4a", 196, "minor", "lowlight"],
  ["Small Hours", "Aurora Fields", "Lowlight", 2021, 3, "m4a", 247, "major", "lowlight"],
  ["Tidewater", "Aurora Fields", "Lowlight", 2021, 4, "m4a", 175, "minor", "lowlight"],
  ["Hollow Bright", "Aurora Fields", "Lowlight", 2021, 5, "m4a", 262, "major", "lowlight"],
  // The Quiet Hours · Paper Moons (2019), album artwork
  ["Paper Moons", "The Quiet Hours", "Paper Moons", 2019, 1, "mp3", 233, "major", "paper-moons"],
  ["Lantern Street", "The Quiet Hours", "Paper Moons", 2019, 2, "mp3", 208, "minor", "paper-moons"],
  ["Weathervane", "The Quiet Hours", "Paper Moons", 2019, 3, "mp3", 185, "major", "paper-moons"],
  ["Slow Return", "The Quiet Hours", "Paper Moons", 2019, 4, "mp3", 165, "minor", "paper-moons"],
  // Mara Lind · Northbound (2023), album artwork
  ["Northbound", "Mara Lind", "Northbound", 2023, 1, "m4a", 294, "major", "northbound"],
  ["Cold Light, Warm Room", "Mara Lind", "Northbound", 2023, 2, "m4a", 220, "minor", "northbound"],
  ["Fjord", "Mara Lind", "Northbound", 2023, 3, "m4a", 262, "major", "northbound"],
  ["Ferry Song", "Mara Lind, Kestrel", "Northbound", 2023, 4, "m4a", 196, "major", "northbound"],
  // Édith Vale · Glass Garden (2020), no album artwork, no track numbers
  ["Glasshouse", "Édith Vale", "Glass Garden", 2020, null, "mp3", 233, "minor", null],
  ["Verdigris", "Édith Vale", "Glass Garden", 2020, null, "mp3", 277, "major", null],
  ["Orangery", "Édith Vale", "Glass Garden", 2020, null, "mp3", 208, "minor", null],
  // Singles: one with its own artwork, the rest without
  ["Late Drive", "Kestrel", null, null, null, "m4a", 185, "minor", "late-drives"],
  ["Signal Fires", "Kestrel", null, null, null, "mp3", 220, "major", null],
  ["Aster", "Noor Halvorsen", null, null, null, "m4a", 247, "major", null],
  ["Untitled Demo", null, null, null, null, "mp3", 165, "minor", null],
];

const PLAYLISTS = [
  {
    name: "Late Drives",
    cover: "late-drives",
    songs: [16, 3, 12, 6, 9, 17],
  },
  { name: "Focus", cover: "glass-garden", songs: [0, 2, 13, 14, 15, 18, 10] },
  { name: "Rainy Sunday", cover: null, songs: [7, 8, 1, 11] },
];
const LIKED = [0, 5, 9, 12, 16];
const ARTIST_COVERS = { "Aurora Fields": "aurora-fields", Kestrel: "kestrel" };

function run(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function slug(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * An arpeggio over a four-chord loop with a soft pad: each note has a sine
 * window, so note changes never click.
 */
function melody(base, mode) {
  const third = mode === "major" ? 4 : 3;
  const chord = `mod(floor(t/2.5),4)`;
  const root = `if(eq(${chord},0),0,if(eq(${chord},1),5,if(eq(${chord},2),7,${mode === "major" ? 9 : 8})))`;
  const step = `mod(floor(t*4),4)`;
  const interval = `if(eq(${step},0),0,if(eq(${step},1),${third},if(eq(${step},2),7,12)))`;
  const note = `${base}*pow(2,(${root}+${interval})/12)`;
  const pluck = `0.32*sin(2*PI*${note}*t)*sin(PI*mod(t,0.25)*4)*exp(-5*mod(t,0.25))`;
  const pad = `0.10*sin(2*PI*${base}/2*pow(2,${root}/12)*t)*sin(PI*mod(t,2.5)/2.5)`;
  return `${pluck}+${pad}`;
}

function cover(name, size) {
  const [c0, c1, c2, type, seed] = COVERS[name];
  const file = join(ROOT, "covers", `${name}_${size === 600 ? "full" : "small"}.jpg`);
  run([
    "-f", "lavfi",
    "-i", `gradients=s=${size}x${size}:c0=${c0}:c1=${c1}:c2=${c2}:nb_colors=3:type=${type}:seed=${seed}`,
    "-frames:v", "1", "-q:v", "5", file,
  ]);
  return file;
}

rmSync(join(ROOT, "audio"), { force: true, recursive: true });
rmSync(join(ROOT, "covers"), { force: true, recursive: true });
mkdirSync(join(ROOT, "audio"));
mkdirSync(join(ROOT, "covers"));
for (const name of Object.keys(COVERS)) {
  cover(name, 600);
  cover(name, 200);
}

const songs = SONGS.map(([title, artist, album, year, track, format, base, mode, art], index) => {
  const file = `${String(index + 1).padStart(2, "0")}-${slug(title)}.${format}`;
  const out = join(ROOT, "audio", file);
  const tags = [
    "-metadata", `title=${title}`,
    ...(artist ? ["-metadata", `artist=${artist}`] : []),
    ...(album ? ["-metadata", `album=${album}`] : []),
    ...(year ? ["-metadata", `date=${year}`] : []),
    ...(track ? ["-metadata", `track=${track}`] : []),
  ];
  const audio = [
    "-f", "lavfi", "-i", `aevalsrc=exprs='${melody(base, mode)}':s=44100:d=${SECONDS}`,
  ];
  const fade = ["-af", `afade=t=in:d=0.3,afade=t=out:st=${SECONDS - 1}:d=1`];
  const codec =
    format === "m4a"
      ? ["-c:a", "aac", "-b:a", "40k", "-ac", "1"]
      : ["-c:a", "libmp3lame", "-b:a", "40k", "-ac", "1", "-id3v2_version", "3"];
  if (art) {
    run([
      ...audio, "-i", join(ROOT, "covers", `${art}_small.jpg`),
      "-map", "0:a", "-map", "1:v", ...fade, ...codec,
      "-c:v", "copy", "-disposition:v", "attached_pic", ...tags, out,
    ]);
  } else {
    run([...audio, ...fade, ...codec, ...tags, out]);
  }
  const durationMs = Math.round(
    Number(
      execFileSync("ffprobe", [
        "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out,
      ]).toString(),
    ) * 1000,
  );
  return {
    file,
    title,
    artists: artist,
    album,
    year,
    track,
    durationMs,
    mimeType: format === "m4a" ? "audio/mp4" : "audio/mpeg",
    cover: art,
  };
});

const manifest = {
  songs,
  playlists: PLAYLISTS.map((playlist) => ({
    ...playlist,
    songs: playlist.songs.map((index) => songs[index].file),
  })),
  liked: LIKED.map((index) => songs[index].file),
  artistCovers: ARTIST_COVERS,
};
writeFileSync(join(ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const total = execFileSync("du", ["-sk", ROOT]).toString().split("\t")[0];
console.log(`${songs.length} songs, ${total} KB (${statSync(join(ROOT, "manifest.json")).size} B manifest)`);
