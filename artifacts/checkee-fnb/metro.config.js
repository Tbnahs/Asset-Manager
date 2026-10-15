const path = require("path");

// Metro transforms assets in worker processes. Preload the image-size adapter
// there as well as in the CLI process; package versions remain untouched.
const imageSizeCompat = path.join(__dirname, "scripts", "image-size-path-compat.cjs");
const preloadFlag = `--require=${imageSizeCompat}`;
if (!process.env.NODE_OPTIONS?.includes(preloadFlag)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, preloadFlag].filter(Boolean).join(" ");
}

const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
