/** A short phone's window (iPhone SE) and a tall one's (Pro Max). */
const SHORT = 667;
const TALL = 932;

export interface PlayerSpacing {
  /** From the song's title row down to the scrubber's row. */
  titleToScrubber: number;
  /** Between each slider's row and the transport, which sits centered. */
  sliderToTransport: number;
  /** From the volume slider's row down to the bottom buttons. */
  volumeToOptions: number;
}

function between(short: number, tall: number, position: number) {
  return Math.round(short + (tall - short) * position);
}

/**
 * The gaps down the player's controls, more of them on a taller phone. The
 * time labels hang under the scrubber's bar and aren't part of any of this,
 * so the transport is centered between the two bars.
 */
export function playerSpacing(windowHeight: number) {
  const position = Math.min(
    Math.max((windowHeight - SHORT) / (TALL - SHORT), 0),
    1,
  );
  return {
    sliderToTransport: between(6, 18, position),
    titleToScrubber: between(12, 22, position),
    volumeToOptions: between(8, 20, position),
  } satisfies PlayerSpacing;
}
