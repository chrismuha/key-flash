const fs = require("fs");
const path = require("path");
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");

function existingIcon(...candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate));
}

const iconBase = existingIcon(
  path.resolve(__dirname, "assets/icons/icon"),
  path.resolve(__dirname, "assets/icon"),
  path.resolve(__dirname, "assets/favicon")
);
const icoIcon = existingIcon(
  path.resolve(__dirname, "assets/icons/icon.ico"),
  path.resolve(__dirname, "assets/icon.ico"),
  path.resolve(__dirname, "assets/favicon.ico"),
  path.resolve(__dirname, "assets/favicon.png")
);
const icnsIcon = existingIcon(
  path.resolve(__dirname, "assets/icons/icon.icns"),
  path.resolve(__dirname, "assets/icon.icns"),
  path.resolve(__dirname, "assets/favicon-mac.icns")
);

module.exports = {
  packagerConfig: {
    asar: true,
    ...(iconBase ? { icon: iconBase } : {})
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: icoIcon ? { setupIcon: icoIcon } : {}
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"]
    },
    {
      name: "@electron-forge/maker-dmg",
      config: icnsIcon ? { icon: icnsIcon } : {}
    },
    {
      name: "@electron-forge/maker-deb",
      config: {}
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {}
    }
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true
    })
  ]
};
