import * as SplashScreen from "expo-splash-screen";

/**
 * Frames to wait after the first screen's list lays out: the native header
 * (title and toolbar), the tab bar's accessory, and the list's rows settle
 * over the next frames, and the splash should lift only once they have.
 */
const SETTLE_FRAMES = 3;

/**
 * If the first screen never says it's ready (a link opened somewhere else),
 * the splash lifts this long after the library opens.
 */
const FALLBACK_MS = 1000;

let revealed = false;

/**
 * Keeps the splash (the app's background color) up past Expo Router's first
 * render, which comes before the library is open and the Library tab has
 * laid out. Without it, a cold launch showed the tab half built for a few
 * frames: rows with no title or + button, then a jump as the header arrived.
 * Call at startup, before the router renders.
 */
export function holdSplash() {
  // The splash fades out, so the app fades in over it.
  SplashScreen.setOptions({ duration: 250, fade: true });
  void SplashScreen.preventAutoHideAsync();
}

/** Lifts the splash now. Only the first call does anything. */
export function revealApp() {
  if (revealed) return;
  revealed = true;
  SplashScreen.hide();
}

/**
 * The first screen has laid out: lifts the splash once the native views
 * around it have caught up.
 */
export function revealWhenSettled() {
  if (!revealed) afterFrames(SETTLE_FRAMES, revealApp);
}

function afterFrames(frames: number, then: () => void) {
  requestAnimationFrame(() => {
    if (frames <= 1) then();
    else afterFrames(frames - 1, then);
  });
}

/**
 * The library is open: the first screen is rendering, and lifts the splash
 * itself (`revealWhenSettled`). This is the backstop for a launch that never
 * shows the Library tab.
 */
export function libraryOpened() {
  setTimeout(revealApp, FALLBACK_MS);
}
