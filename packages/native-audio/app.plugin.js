const {
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
} = require("expo/config-plugins");

const withSynqNativeAudio = (config) => {
  const withIosAudioBackgroundMode = withInfoPlist(config, (nextConfig) => {
    const modes = new Set(nextConfig.modResults.UIBackgroundModes ?? []);
    modes.add("audio");
    nextConfig.modResults.UIBackgroundModes = Array.from(modes);
    return nextConfig;
  });

  return withAndroidManifest(withIosAudioBackgroundMode, (nextConfig) => {
    const manifest = nextConfig.modResults.manifest;
    manifest["uses-permission"] ??= [];
    manifest["uses-permission"] = AndroidConfig.Permissions.ensurePermissions(
      nextConfig.modResults,
      [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "android.permission.POST_NOTIFICATIONS",
      ],
    );
    return nextConfig;
  });
};

module.exports = withSynqNativeAudio;
