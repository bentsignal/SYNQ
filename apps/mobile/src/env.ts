export const env = {
  /**
   * A production bundle served to the dev client for measuring performance
   * (`SYNQ_METRO_PROFILE=1 scripts/sim.sh up`), which keeps the scripts'
   * hooks (`globalThis.synqDev`) that only development bundles have
   * otherwise.
   */
  profileBundle: process.env.EXPO_PUBLIC_PROFILE_BUNDLE === "1",
};
