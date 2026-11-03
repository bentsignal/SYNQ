// Renders every backdrop variant over a set of covers into one contact sheet,
// using the app's real analysis, palette code, and shader.
//
//   node --experimental-strip-types apps/mobile/dev/backdrop-lab/lab.mjs \
//     [--covers a,b,c] [--variants x,y] [--time 120] [--out sheet.png]
//
// Covers live in .cache/backdrop-lab/covers (gitignored, never committed).
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import {
  CURRENT_VARIANT,
  VARIANTS,
} from "../../src/features/player/backdrop-variants.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const lab = path.join(root, ".cache/backdrop-lab");
const native = path.join(here, "../../modules/synq-backdrop/ios");
const { values } = parseArgs({
  options: {
    covers: { type: "string" },
    out: { default: "sheet.png", type: "string" },
    time: { default: "120", type: "string" },
    variants: { type: "string" },
  },
});

const tool = path.join(lab, "backdrop-lab");
execFileSync("swiftc", [
  "-O",
  path.join(here, "main.swift"),
  path.join(native, "ArtworkAnalysis.swift"),
  path.join(native, "BackdropShader.swift"),
  "-o",
  tool,
]);

const coverDir = path.join(lab, "covers");
// Name to place on the command line, so the sheet follows the order asked for.
const wanted =
  values.covers === undefined
    ? undefined
    : new Map(values.covers.split(",").map((name, index) => [name, index]));
function placeOf(file) {
  return wanted?.get(path.parse(file).name) ?? 0;
}
const files = readdirSync(coverDir)
  .filter((file) => /\.(png|jpe?g)$/.test(file))
  .filter((file) => wanted?.has(path.parse(file).name) ?? true)
  .sort((a, b) => placeOf(a) - placeOf(b) || a.localeCompare(b));
const variants = [CURRENT_VARIANT, ...VARIANTS].filter(
  (variant) => values.variants?.split(",").includes(variant.id) ?? true,
);

const renders = path.join(lab, "renders");
mkdirSync(renders, { recursive: true });
const jobs = [];
const rows = files.map((file) => {
  const name = path.parse(file).name;
  const image = path.join(coverDir, file);
  const analysis = JSON.parse(
    execFileSync(tool, ["analyze", image], { encoding: "utf8" }),
  );
  return {
    image,
    name,
    cells: variants.map((variant) => {
      const out = path.join(renders, `${name}-${variant.id}.png`);
      const { look, swatches } = variant.design(analysis);
      jobs.push({ look, out, swatches, time: Number(values.time) });
      return { out, swatches };
    }),
  };
});
const jobsPath = path.join(lab, "jobs.json");
writeFileSync(jobsPath, JSON.stringify(jobs));
const report = execFileSync(tool, ["render", jobsPath], { encoding: "utf8" })
  .trim()
  .split("\n")
  .map((line) => line.split("\t"));
// White text over the brightest the backdrop gets from the title down. A
// failure here at one moment is a failure: the pools drift.
const worst = new Map();
for (const [file, luminance] of report) {
  const contrast = 1.05 / (Number(luminance) + 0.05);
  const variant = variants.find(({ id }) => file.endsWith(`-${id}.png`))?.label;
  if (!(worst.get(variant)?.contrast < contrast)) {
    worst.set(variant, { contrast, cover: path.basename(file) });
  }
  if (contrast < 4.5) {
    console.log(
      `low contrast ${contrast.toFixed(2)}:1  ${path.basename(file)}`,
    );
  }
}
for (const [variant, { contrast, cover }] of worst) {
  console.log(`${variant}: worst ${contrast.toFixed(2)}:1 (${cover})`);
}

const sheetPath = path.join(lab, "sheet.json");
const out = path.join(lab, values.out);
writeFileSync(
  sheetPath,
  JSON.stringify({
    columns: variants.map((variant) => variant.label),
    out,
    rows: rows.map((row) => ({
      cells: row.cells.map((cell) => cell.out),
      cover: row.image,
      name: row.name,
    })),
  }),
);
execFileSync(tool, ["sheet", sheetPath]);
console.log(out);
