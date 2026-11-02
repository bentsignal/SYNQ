/**
 * What Wi-Fi Transfer's page is told over its live link, and what the server
 * should be doing, as plain data. No React or native code, so it runs in
 * plain unit tests. The page side is in `transfer-page.ts`.
 */

/** What the page shows that only the phone knows. */
export interface LiveState {
  /** Whether uploads are allowed. */
  readonly on: boolean;
  /** The theme's accent. */
  readonly accent: string;
  /** A batch is importing, so sent files aren't in the library yet. */
  readonly importing: boolean;
  /** How many songs the current or last batch imported. */
  readonly imported: number;
}

/** The server as the sheet shows it. */
export type TransferServerState =
  /** Not running. On an older binary, that's what "off" means. */
  | { state: "idle" }
  | { state: "starting" }
  | { state: "ready"; address: string; port: number }
  | { state: "offline" }
  | { state: "failed" };

export function liveMessage(live: LiveState) {
  return JSON.stringify(live);
}

/** The address to type into a browser: port 80 needs no port. */
export function displayAddress(address: string, port: number) {
  return port === 80 ? address : `${address}:${String(port)}`;
}

/** Whether the server should be running. */
export function wantsServer({
  hasLiveLink,
  on,
  used,
}: {
  /** The binary's server can refuse uploads and hold a live link. */
  hasLiveLink: boolean;
  /** The switch. */
  on: boolean;
  /** Someone opened Wi-Fi Transfer, this launch or an earlier one. */
  used: boolean;
}) {
  // Starting a listener can bring up iOS's Local Network prompt, so never
  // before someone has come here. An older binary's server can't refuse
  // anything, so it runs only while uploads are allowed.
  return hasLiveLink ? used : on;
}

/**
 * A page's going away isn't shown until it has been gone this long, so its
 * reconnecting doesn't flicker the sheet's row.
 */
export const PAGE_GONE_MS = 2500;
