import { AUDIO_TYPES } from "./clean-tags.ts";
import { TRANSFER_PAGE } from "./transfer-page.generated.ts";

/** The extensions Wi-Fi Transfer accepts (the server checks them too). */
export const TRANSFER_EXTENSIONS = Object.keys(AUDIO_TYPES);

/**
 * The native server puts the live state here as it serves the page, so the
 * first paint is already right (`TransferServer.stateToken`). An older
 * binary leaves it, and the script falls back on the accent in the CSS.
 */
export const LIVE_STATE_TOKEN = "__SYNQ_LIVE_STATE__";

/** Where the page's CSS takes the accent (`transfer-page-source/style.css`). */
const ACCENT_TOKEN = "__SYNQ_ACCENT__";

/**
 * The page a computer's browser loads from Wi-Fi Transfer: drop or choose
 * audio files anywhere on it, and they upload one at a time as the request
 * body, so the phone streams each to disk. A single self-contained file,
 * since it has to work with no internet. Near-black with the person's accent,
 * which follows the phone's theme. Built from `transfer-page-source/`
 * (`pnpm build:transfer-page`).
 */
export function transferPage({ accent }: { accent: string }) {
  const color = /^#[0-9a-f]{6}$/i.test(accent) ? accent : "#77adf8";
  return TRANSFER_PAGE.replace(ACCENT_TOKEN, color);
}
