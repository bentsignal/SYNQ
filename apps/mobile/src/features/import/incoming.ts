import { setIncomingImports } from "./queue.ts";

/** Songs on their way to the queue, by what will hand them over. */
const incoming = { download: 0, folder: 0 };

/**
 * How many songs downloads, or picked folders, will still hand over. The
 * queue keeps the batch open for all of them and counts them in its total.
 */
export function setIncoming(from: keyof typeof incoming, count: number) {
  incoming[from] = count;
  setIncomingImports(incoming.download + incoming.folder);
}
