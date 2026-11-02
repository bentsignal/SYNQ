/**
 * Development builds only: runs the import queue on copies of the staged
 * sample audio (`scripts/sim.sh seed` stages it), as a large Files pick
 * would, for measuring an import without driving the Files picker:
 * `scripts/sim.sh eval "synqDev.importSample(400)"`.
 */
import { Directory, File, Paths } from "expo-file-system";

import type { ImportSource } from "~/features/import/pipeline";
import { addImportSources } from "~/features/import/session";
import { stagedFolder } from "./sample-manifest";

export function importSample(count: number) {
  const audio = new Directory(stagedFolder(), "audio")
    .list()
    .filter((entry) => entry instanceof File);
  const folder = new Directory(Paths.cache, "DocumentPicker");
  folder.create({ idempotent: true, intermediates: true });
  const run = Date.now().toString(36);
  const sources = Array.from({ length: count }, (_, index): ImportSource => {
    const file = audio[index % audio.length];
    if (file === undefined) throw new Error("No sample audio staged.");
    const copy = new File(folder, `${run}-${String(index)}-${file.name}`);
    file.copySync(copy);
    return {
      key: `sample-${run}-${String(index)}`,
      mimeType: null,
      name: `${String(index)}-${file.name}`,
      uri: copy.uri,
    };
  });
  addImportSources(sources);
  return { files: sources.length };
}
