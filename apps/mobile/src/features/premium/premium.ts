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

interface PremiumState {
  readonly status: PremiumStatus;
  /** RevenueCat answered during this launch. */
  readonly confirmed: boolean;
}

let state: PremiumState = {
  confirmed: false,
  status: cachedPremium(readJson(STORAGE_KEY, premiumFromStored), Date.now()),
};
const listeners = new Set<() => void>();

function publish(next: PremiumState) {
  const changed = next.status.active !== state.status.active;
  state = next;
  for (const listener of listeners) listener();
  if (changed) setPersonProperties({ premium: next.status.active });
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
  const status = premiumFromCustomerInfo(info, Date.now());
  writeJson(STORAGE_KEY, status);
  publish({ confirmed: true, status });
  if (!status.active) resetPremiumAppearance();
  return status;
}

/**
 * 2.5.2's cached expiration, which the library's startup leaves for this
 * feature. Applies only until RevenueCat has answered.
 */
function adoptLegacyCache() {
  const cache = takeLegacySettings("premiumCache");
  if (cache === null || state.confirmed) return;
  const status = premiumFromLegacyCache(cache, Date.now());
  if (status.active && !state.status.active) {
    writeJson(STORAGE_KEY, status);
    publish({ ...state, status });
  }
}

/** Runs `adoptLegacyCache` once the library is open (startup applies 2.5.2's settings). */
function whenLibraryOpens(run: () => void) {
  const opened = () =>
    queryClient.getQueryState(["startup"])?.status === "success";
  if (opened()) {
    run();
    return;
  }
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (!opened()) return;
    unsubscribe();
    run();
  });
}

let started = false;

/**
 * Configures RevenueCat and starts following the customer's status. Call
 * once at startup.
 */
export function startPremium() {
  if (started) return;
  started = true;
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
  return state.status;
}

/** Whether someone has Premium right now. */
export function isPremium() {
  return state.status.active;
}

/** Calls `listener` whenever the status changes; returns an unsubscribe. */
export function subscribePremium(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Whether someone has Premium (or, with `select`, part of the status),
 * re-rendering when it changes. `select` must return a primitive or a part
 * of the status as it is, never a new object.
 */
export function usePremium<Selected = boolean>(
  select: (status: PremiumStatus) => Selected = (status) =>
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- The default selector returns `active`, which is what `Selected` defaults to.
    status.active as Selected,
) {
  return useSyncExternalStore(subscribePremium, () => select(state.status));
}

