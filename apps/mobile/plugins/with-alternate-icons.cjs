const fs = require("node:fs");
const path = require("node:path");
const {
  IOSConfig,
  withDangerousMod,
  withXcodeProject,
} = require("@expo/config-plugins");

/**
 * Adds 1024 px PNGs as iOS alternate app icons: each becomes an app icon
 * set in the app's asset catalog, and the build settings list them in
 * ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES, from which Xcode writes
 * `CFBundleAlternateIcons`. The app switches between them with
 * `expo-alternate-app-icons` (src/features/app-icon/app-icon.ts), whose own
 * plugin isn't used so the names stay exactly 2.5.2's.
 *
 * Options: `{ icons: ["./assets/icons/icon-blue.png", ...] }`. Each icon's
 * name is its file name without `.png`, and iOS remembers the person's
 * choice by that name.
 */
function iconName(iconPath) {
  return path.basename(iconPath, ".png");
}

/** An app icon set's Contents.json: one universal 1024 px image. */
function iconSetContents(fileName) {
  return {
    images: [
      {
        filename: fileName,
        idiom: "universal",
        platform: "ios",
        size: "1024x1024",
      },
    ],
    info: { author: "expo", version: 1 },
  };
}

function withAlternateIconFiles(config, icons) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const { platformProjectRoot, projectName, projectRoot } =
        config.modRequest;
      const catalog = path.join(
        platformProjectRoot,
        projectName,
        "Images.xcassets",
      );
      for (const icon of icons) {
        const name = iconName(icon);
        const set = path.join(catalog, `${name}.appiconset`);
        await fs.promises.mkdir(set, { recursive: true });
        await fs.promises.copyFile(
          path.join(projectRoot, icon),
          path.join(set, `${name}.png`),
        );
        await fs.promises.writeFile(
          path.join(set, "Contents.json"),
          `${JSON.stringify(iconSetContents(`${name}.png`), null, 2)}\n`,
        );
      }
      return config;
    },
  ]);
}

function withAlternateIconProject(config, icons) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const { projectName } = config.modRequest;
    const [, target] = IOSConfig.Target.findNativeTargetByName(
      project,
      projectName,
    );
    const configurations = IOSConfig.XcodeUtils.getBuildConfigurationsForListId(
      project,
      target.buildConfigurationList,
    );
    for (const [, configuration] of configurations) {
      if (configuration.buildSettings === undefined) continue;
      Object.assign(configuration.buildSettings, alternateIconSettings(icons));
    }
    return config;
  });
}

/** The build settings that compile the icon sets as alternate icons. */
function alternateIconSettings(icons) {
  return {
    ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES: `"${icons.map(iconName).join(" ")}"`,
    ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS: "YES",
  };
}

module.exports = function withAlternateIcons(config, { icons = [] } = {}) {
  return withAlternateIconProject(withAlternateIconFiles(config, icons), icons);
};
module.exports.alternateIconSettings = alternateIconSettings;
module.exports.iconName = iconName;
module.exports.iconSetContents = iconSetContents;
