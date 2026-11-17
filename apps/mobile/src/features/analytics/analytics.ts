import type PostHogClient from "posthog-react-native";
import Constants from "expo-constants";

/**
 * Product analytics (PostHog), as 2.5.2 sent them: the same project and
 * event names. Only the App Store app reports; SYNQ Dev and development
 * bundles never do. PostHog keeps its anonymous id in
 * `Documents/.posthog-rn.json`, the file 2.5.2's SDK wrote, so people keep
 * their id across the update.
 */

const POSTHOG_KEY = "phc_ximd5fBQ6xeWScXmzyuVZfgxwvdtemFOzcs7SI6qP76";
const POSTHOG_HOST = "https://us.i.posthog.com";

/** The App Store build: SYNQ's scheme, and not a development bundle. */
const reporting = !__DEV__ && Constants.expoConfig?.scheme === "synq";

/**
 * PostHog starts this long after launch, so its SDK (a tenth of the bundle)
 * loads and reads its storage after the first screen is up, not before.
 * Nothing is tracked at launch; a `track` before then starts it at once.
 */
const START_AFTER_MS = 3000;

let posthog: PostHogClient | undefined;

function startPostHog() {
  if (posthog !== undefined) return posthog;
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-assertions -- An import statement would load the SDK during launch, in every build.
  const { default: PostHog } = require("posthog-react-native") as {
    default: typeof PostHogClient;
  };
  posthog = new PostHog(POSTHOG_KEY, {
    captureAppLifecycleEvents: true,
    host: POSTHOG_HOST,
  });
  return posthog;
}

if (reporting) setTimeout(startPostHog, START_AFTER_MS);

/** A property value PostHog accepts. */
export type EventValue = string | number | boolean | null;

/**
 * Records an event, such as `track("import_finish", { numberOfSongs: 3 })`.
 * Keep 2.5.2's names for events it had (see docs/analytics.md).
 */
export function track(event: string, properties?: Record<string, EventValue>) {
  if (reporting) startPostHog().capture(event, properties);
}
