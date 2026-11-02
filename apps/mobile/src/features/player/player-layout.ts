/** The heart's and the `ellipsis`'s circles. */
export const PLAYER_CIRCLE = 34;
export const SKIP_SIZE = 40;
export const PLAY_SIZE = 50;
/** Each transport button's square; the row is this tall. */
export const TRANSPORT_BOX = 72;
export const TRANSPORT_GAP = 14;
export const OPTION_SIZE = 24;
/** Each bottom button's square; the row is this tall. */
export const OPTION_BOX = 44;
/** The queue's smaller transport. */
export const QUEUE_SKIP_SIZE = 26;
export const QUEUE_PLAY_SIZE = 32;
export const QUEUE_TRANSPORT_BOX = 52;
export const QUEUE_TRANSPORT_GAP = 22;

/** The artwork's margin at each side of the screen. */
const ARTWORK_INSET = 30;
/** Short phones: the artwork leaves the controls room, at this share of the window. */
const ARTWORK_MAX_SHARE = 0.46;

/** Grabber to artwork, over the sheet's top padding and the grabber. */
export const ARTWORK_TOP = 22;

/**
 * What's left under the artwork goes between the rows in these proportions,
 * measured off Apple Music's player. Above the title takes a little more than
 * below it, since the artwork's shadow reads as part of the gap's top and the
 * title's line has more clear space below it than above. The times hang inside
 * the gap under the scrubber, and the two gaps around the transport match, so
 * it's centered between the bars. A small phone keeps at least `PLAYER_GAP_MIN`.
 */
export const PLAYER_GAPS = {
  artworkToTitle: 42,
  optionsToBottom: 8,
  sliderToTransport: 40,
  titleToScrubber: 34,
  volumeToOptions: 22,
};
export const PLAYER_GAP_MIN = 6;

export function playerArtworkSize(windowWidth: number, windowHeight: number) {
  return Math.round(
    Math.min(windowWidth - ARTWORK_INSET * 2, windowHeight * ARTWORK_MAX_SHARE),
  );
}
