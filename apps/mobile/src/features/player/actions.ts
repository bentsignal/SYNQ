/**
 * What the rest of the app asks of the player. Library screens call these
 * with song ids; the player loads the songs, builds native tracks, and
 * owns the queue from there (`commands.ts`, `@synq/audio`).
 */
import "./startup";

export type { PlaybackSource, PlayOptions } from "./types";
export { addToQueue, forgetSongs, playNext, playSongs } from "./commands";
