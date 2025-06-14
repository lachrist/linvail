const {
  Error,
  Object: { hasOwn },
} = globalThis;

/**
 * @type {import("./config.d.ts").RegionConfig}
 */
const default_region_config = {
  dir: (_value) => {
    throw new Error(
      "linvail/library.dir is disabled because config.dir is missing",
    );
  },
  wrapPrimitive: (inner) => ({
    type: "primitive",
    inner,
  }),
  wrapGuestReference: (guest, name) => ({
    type: "guest",
    inner: guest,
    name,
  }),
  wrapHostReference: (host, kind) => ({
    type: "host",
    kind,
    inner: null,
    plain: host,
  }),
  warn: (message) => {
    if (hasOwn(globalThis, "console")) {
      const { console } = globalThis;
      if (hasOwn(console, "warn")) {
        return console.warn(message);
      }
      if (hasOwn(console, "log")) {
        return console.log(message);
      }
    }
    throw new Error(message);
  },
};

/**
 * @type {(
 *   config: import("./config.d.ts").PartialRegionConfig,
 * ) => import("./config.d.ts").RegionConfig}
 */
export const completeRegionConfig = (config) => ({
  ...default_region_config,
  ...config,
});
