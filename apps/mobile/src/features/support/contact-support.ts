import { Alert, Linking } from "react-native";

import { track } from "~/features/analytics/analytics";

/** SYNQ's support address. Everything in the app that reaches support uses it. */
const SUPPORT_EMAIL = "help@bentsignal.com";
const SUPPORT_URL = `mailto:${SUPPORT_EMAIL}`;

/** Opens Mail; without a mail account set up, shows the address instead. */
export function contactSupport() {
  track("social_press", { url: SUPPORT_URL });
  Linking.openURL(SUPPORT_URL).catch(() =>
    Alert.alert("Contact Support", SUPPORT_EMAIL),
  );
}
