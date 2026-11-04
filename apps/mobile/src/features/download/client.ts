import {
  API_VERSION,
  decodeError,
  decodeJob,
  decodeServerInfo,
} from "./contract.ts";

/** A server to talk to, with its token. */
export interface ServerAccess {
  readonly url: string;
  readonly token: string;
}

/** The server answered, and said no. Its message is written to be shown. */
export class ServerError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/** A sleeping server takes a few seconds to wake before it answers. */
const REQUEST_TIMEOUT_MS = 30_000;
const NOT_A_SERVER = "That address isn't a download server.";

async function bodyOf(response: Response) {
  const body = known(await response.json().catch(() => null));
  if (response.ok) return body;
  const error = decodeError(body);
  throw new ServerError(
    response.status,
    error?.code ?? "unknown",
    error?.message ?? NOT_A_SERVER,
  );
}

function known(value: unknown) {
  return value;
}

function send(
  server: ServerAccess,
  path: string,
  init: { method?: "DELETE" | "POST"; body?: string } = {},
) {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), REQUEST_TIMEOUT_MS);
  return fetch(`${server.url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${server.token}`,
      ...(init.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    signal: abort.signal,
  })
    .then(bodyOf)
    .finally(() => clearTimeout(timeout));
}

function jobFrom(body: unknown) {
  const job = decodeJob(body);
  if (job === null) throw new ServerError(200, "unknown", NOT_A_SERVER);
  return job;
}

function downloadPath(jobId: string) {
  return `/v1/downloads/${encodeURIComponent(jobId)}`;
}

function trackPath(jobId: string, trackId: string) {
  return `${downloadPath(jobId)}/tracks/${encodeURIComponent(trackId)}`;
}

/** Checks the address and token together. Throws what to tell the person. */
export async function fetchServerInfo(server: ServerAccess) {
  const info = decodeServerInfo(await send(server, "/v1/me"));
  if (info === null) throw new ServerError(200, "unknown", NOT_A_SERVER);
  if (info.api !== API_VERSION) {
    throw new ServerError(
      200,
      "unsupported_version",
      "This server needs a newer version of SYNQ.",
    );
  }
  return info;
}

export async function startJob(server: ServerAccess, url: string) {
  return jobFrom(
    await send(server, "/v1/downloads", {
      body: JSON.stringify({ url }),
      method: "POST",
    }),
  );
}

export async function fetchJob(server: ServerAccess, jobId: string) {
  return jobFrom(await send(server, downloadPath(jobId)));
}

export async function cancelJob(server: ServerAccess, jobId: string) {
  await send(server, downloadPath(jobId), { method: "DELETE" });
}

/** Tells the server the phone has this song, so it can fetch the next. */
export async function acknowledgeTrack(
  server: ServerAccess,
  jobId: string,
  trackId: string,
) {
  return jobFrom(
    await send(server, trackPath(jobId, trackId), { method: "DELETE" }),
  );
}

export function trackFileUrl(
  server: ServerAccess,
  jobId: string,
  trackId: string,
) {
  return `${server.url}${trackPath(jobId, trackId)}/file`;
}
