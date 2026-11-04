import type { RemoteJob, RemoteTrack } from "./contract.ts";

/** How a job stands, counted for a download's row and the import queue. */

export function failedLine(failed: number) {
  return failed === 1
    ? "1 song couldn't be downloaded."
    : `${String(failed)} songs couldn't be downloaded.`;
}

/** Identifies a track across retries of a job. */
export function handoverKey(job: RemoteJob, track: RemoteTrack) {
  return `${job.id}/${track.id}`;
}

export function jobCounts(job: RemoteJob, handedOver: ReadonlySet<string>) {
  return {
    done: job.tracks.filter(
      (track) =>
        track.state === "delivered" || handedOver.has(handoverKey(job, track)),
    ).length,
    failed: job.tracks.filter(({ state }) => state === "failed").length,
    total: job.tracks.length,
  };
}
