const { withInfoPlist } = require("expo/config-plugins");

/** Lets playback continue in the background and on the lock screen. */
const withSynqAudio = (config) =>
  withInfoPlist(config, (next) => {
    const modes = new Set(next.modResults.UIBackgroundModes ?? []);
    modes.add("audio");
    next.modResults.UIBackgroundModes = [...modes];
    return next;
  });

module.exports = withSynqAudio;
