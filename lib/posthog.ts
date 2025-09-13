import { PUBLIC_POSTHOG_KEY } from "@/src/constants/Keys";
import PostHog from "posthog-react-native";

export const posthog = new PostHog(PUBLIC_POSTHOG_KEY, {
  // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
  host: "https://us.i.posthog.com", // host is optional if you use https://us.i.posthog.com
  disabled: __DEV__,
});
