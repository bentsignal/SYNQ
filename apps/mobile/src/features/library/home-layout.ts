export const CARD_GAP = 16;
export const CARD_PADDING = 16;
/** Two lines of footnote text and the gap above them, under a card's artwork. */
const CARD_TEXT_HEIGHT = 44;

/** A card's height, from its artwork's size. */
export function cardHeight(size: number) {
  return size + CARD_TEXT_HEIGHT;
}
