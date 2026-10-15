const fs = require("fs");
const path = require("path");

// Metro 0.83 passes image paths to image-size v1. The workspace's security
// override resolves image-size v2, which only accepts bytes. Keep package
// versions intact and adapt Metro's asset metadata input before worker startup.
const pnpmStore = path.resolve(__dirname, "..", "..", "node_modules", ".pnpm");
if (fs.existsSync(pnpmStore)) {
  for (const entry of fs.readdirSync(pnpmStore)) {
    if (!entry.startsWith("metro@")) continue;
    const metroAssets = path.join(pnpmStore, entry, "node_modules", "metro", "src", "Assets.js");
    if (!fs.existsSync(metroAssets)) continue;

    const source = fs.readFileSync(metroAssets, "utf8");
    const legacyPathInput = ": assetInfo.files[0];";
    if (source.includes(legacyPathInput)) {
      fs.writeFileSync(
        metroAssets,
        source.replace(legacyPathInput, ": _fs.default.readFileSync(assetInfo.files[0]);"),
      );
    }
  }
}

const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
