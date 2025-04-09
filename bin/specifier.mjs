/**
 * @type {(
 *   location: string,
 *   base: string,
 * ) => import("./config.d.ts").Specifier}
 */
export const toSpecifier = (location, base) => {
  const parts1 = location.split("/");
  if (parts1.at(-1) === "") {
    parts1.pop();
  }
  const parts2 = base.split("/");
  if (parts2.at(-1) === "") {
    parts2.pop();
  }
  while (parts1.length > 0 && parts2.length > 0 && parts1[0] === parts2[0]) {
    parts1.shift();
    parts2.shift();
  }
  if (parts2.length > 0) {
    for (let index = 0; index < parts2.length; index++) {
      parts1.unshift("..");
    }
  } else {
    parts1.unshift(".");
  }
  return /** @type {import("./config.d.ts").Specifier} */ (parts1.join("/"));
};
