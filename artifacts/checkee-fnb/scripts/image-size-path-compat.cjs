const fs = require("node:fs");
const Module = require("node:module");

const originalLoad = Module._load;
const patched = Symbol.for("checkee-fnb.image-size-path-compat");

Module._load = function loadWithImageSizePathCompat(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain);
  if (request !== "image-size" || !loaded || loaded[patched]) return loaded;

  const wrap = (imageSize) => {
    const compatibleImageSize = (input, ...args) =>
      imageSize(
        typeof input === "string" && fs.existsSync(input)
          ? fs.readFileSync(input)
          : input,
        ...args,
      );
    Object.assign(compatibleImageSize, imageSize);
    return compatibleImageSize;
  };

  if (typeof loaded === "function") {
    const compatibleImageSize = wrap(loaded);
    Object.defineProperty(compatibleImageSize, patched, { value: true });
    return compatibleImageSize;
  }

  if (typeof loaded.default === "function") loaded.default = wrap(loaded.default);
  if (typeof loaded.imageSize === "function") loaded.imageSize = wrap(loaded.imageSize);
  Object.defineProperty(loaded, patched, { value: true });
  return loaded;
};
