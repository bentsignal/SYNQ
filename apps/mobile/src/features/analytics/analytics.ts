import Constants from "expo-constants";
import PostHog from "posthog-react-native";

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

const posthog = reporting
  ? new PostHog(POSTHOG_KEY, {
      captureAppLifecycleEvents: true,
      host: POSTHOG_HOST,
    })
  : null;

/** A property value PostHog accepts. */
export type EventValue = string | number | boolean | null;

/**
 * Records an event, such as `track("import_finish", { numberOfSongs: 3 })`.
 * Keep 2.5.2's names for events it had (see docs/analytics.md).
 */
export function track(event: string, properties?: Record<string, EventValue>) {
  posthog?.capture(event, properties);
}

/** Sets properties on the person, as 2.5.2's `$set` events did. */
export function setPersonProperties(properties: Record<string, EventValue>) {
  posthog?.capture("$set", { $set: properties });
}
