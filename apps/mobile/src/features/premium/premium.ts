import type { CustomerInfo } from "react-native-purchases";
import { useSyncExternalStore } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

import type { PremiumStatus } from "./status";
import { setPersonProperties } from "~/features/analytics/analytics";
import {
  APP_ICONS,
  currentAppIcon,
  setAppIcon,
} from "~/features/app-icon/app-icon";
import { takeLegacySettings } from "~/features/library/legacy-settings";
import { getPreference, setPreference } from "~/features/preferences/store";
import { DEFAULT_THEME } from "~/features/preferences/themes";
import { readJson, writeJson } from "~/lib/kv";
import { queryClient } from "~/lib/query-client";
import { REVENUECAT_IOS_KEY } from "./config";
import {
  cachedPremium,
  premiumFromCustomerInfo,
  premiumFromLegacyCache,
  premiumFromStored,
} from "./status";

/**
 * Premium status, from RevenueCat. The last answer is kept in the
 * kv-store so launches (and offline ones) start with it; on the first
 * launch after updating from 2.5.2, 2.5.2's own cached expiration stands
 * in until RevenueCat answers. RevenueCat keeps 2.5.2's anonymous user id
 * and caches customer info itself. Purchases are never restored
 * automatically (2.5.2 did on every launch); Restore Purchases does.
 */

const STORAGE_KEY = "synq.premium";

let status = cachedPremium(
  readJson(STORAGE_KEY, premiumFromStored),
  Date.now(),
);
/** RevenueCat answered during this launch. */
let confirmed = false;
const listeners = new Set<() => void>();

function publish(next: PremiumStatus) {
  const changed = next.active !== status.active;
  status = next;
  for (const listener of listeners) listener();
  if (changed) setPersonProperties({ premium: next.active });
}

/**
 * 2.5.2 reset the theme and app icon when Premium was gone; so does 3.0,
 * once RevenueCat says so (never on a guess).
 */
function resetPremiumAppearance() {
  if (getPreference("theme") !== DEFAULT_THEME) {
    setPreference("theme", DEFAULT_THEME);
  }
  const icon = currentAppIcon();
  if (icon !== null && icon !== APP_ICONS[0].name) {
    void setAppIcon(APP_ICONS[0].name).catch(() => undefined);
  }
}

/** Applies what RevenueCat said. */
export function applyCustomerInfo(info: CustomerInfo) {
  const next = premiumFromCustomerInfo(info, Date.now());
  writeJson(STORAGE_KEY, next);
  confirmed = true;
  if (developmentOverride) return next;
  publish(next);
  // After the library opens: on the first launch after updating from 2.5.2,
  // that's when 2.5.2's theme is applied, which RevenueCat often answers
  // before. Resetting earlier would find the default and leave the Premium
  // theme on.
  if (!next.active) whenLibraryOpens(resetPremiumAppearance);
  return next;
}

/**
 * 2.5.2's cached expiration, which the library's startup leaves for this
 * feature. Applies only until RevenueCat has answered.
 */
function adoptLegacyCache() {
  const cache = takeLegacySettings("premiumCache");
  if (cache === null || confirmed) return;
  const legacy = premiumFromLegacyCache(cache, Date.now());
  if (legacy.active && !status.active) {
    writeJson(STORAGE_KEY, legacy);
    publish(legacy);
  }
}

/** Runs `adoptLegacyCache` once the library is open (startup applies 2.5.2's settings). */
function libraryOpened() {
  return queryClient.getQueryState(["startup"])?.status === "success";
}

function whenLibraryOpens(run: () => void) {
  if (libraryOpened()) {
    run();
    return;
  }
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (!libraryOpened()) return;
    unsubscribe();
    run();
  });
}

let started = false;

/**
 * Development builds only: SYNQ Dev's bundle id has no App Store products,
 * so Premium can't be bought there. `globalThis.synqPremium.set(true)` (or
 * `scripts/sim.sh eval`) turns it on until the next launch; RevenueCat's
 * answers are ignored meanwhile. Never stored.
 */
let developmentOverride = false;

function installDevelopmentOverride() {
  if (!__DEV__) return;
  Object.assign(globalThis, {
    synqPremium: {
      set(active: boolean) {
        developmentOverride = true;
        publish(
          active
            ? {
                active: true,
                expiresAt: null,
                plan: "lifetime",
                willRenew: false,
              }
            : premiumFromStored(null),
        );
      },
    },
  });
}

/**
 * Configures RevenueCat and starts following the customer's status. Call
 * once at startup.
 */
export function startPremium() {
  if (started) return;
  started = true;
  installDevelopmentOverride();
  whenLibraryOpens(adoptLegacyCache);
  try {
    if (__DEV__) void Purchases.setLogLevel(LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
  } catch {
    // A build without the native SDK stays on the cached status.
    return;
  }
  Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
  // Offline, RevenueCat answers from its cache or fails; either way the
  // stored status stands until it can say otherwise.
  Purchases.getCustomerInfo().then(applyCustomerInfo, () => undefined);
}

/** The current status, for code outside React (the player's ad). */
export function getPremium() {
  return status;
}

/** Whether someone has Premium right now. */
export function isPremium() {
  return status.active;
}

/** Calls `listener` whenever the status changes; returns an unsubscribe. */
export function subscribePremium(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function activeSnapshot() {
  return status.active;
}

/** Whether someone has Premium, re-rendering when it changes. */
export function usePremium() {
  return useSyncExternalStore(subscribePremium, activeSnapshot);
}

/**
 * Part of the Premium status, re-rendering when it changes. `select`
 * returns a primitive or a part of the status as it is, never a new object.
 */
export function usePremiumStatus<Selected>(
  select: (current: PremiumStatus) => Selected,
) {
  return useSyncExternalStore(subscribePremium, () => select(status));
}
