/**
 * Snapshotting the plain-data fields of a system or renderer.
 *
 * Deliberately *not* driven by `ConfigSchema` — a config item's `prop` isn't
 * always a stable save key, and some state has no config item at all.
 *
 * Keeps every own field that is plain data, drops everything else.
 */

/**
 * Fields every system and renderer has that describe it rather than
 * parameterize it. Restoring these would at best be a no-op and at worst pin a
 * reloaded world to an outdated schema.
 */
const SKIP = new Set([
  "id",
  "title",
  "description",
  "enabled",
  "after",
  "config",
  "baseConfig",
  "actions",
  "world",
]);

/**
 * Whether a value survives a round trip as plain data.
 *
 * Rejects class instances by checking the prototype — an object carrying
 * methods is a live wiring reference, not state, and the fresh instance
 * already has its own.
 */
function isPlainData(value: unknown, depth = 0): boolean {
  if (depth > 4) return false;

  if (value === null) return true;

  switch (typeof value) {
    case "number":
    case "string":
    case "boolean":
      return true;
    case "object":
      break;
    default:
      return false;
  }

  if (Array.isArray(value)) {
    return value.every(item => isPlainData(item, depth + 1));
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;

  return Object.values(value as object).every(item =>
    isPlainData(item, depth + 1)
  );
}

/**
 * Collects the plain-data fields of an object, ready to be handed to
 * structured clone.
 */
export function snapshotProps(source: object): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (SKIP.has(key)) continue;
    if (!isPlainData(value)) continue;

    props[key] = value;
  }

  return props;
}

/**
 * Writes saved fields back onto a freshly constructed instance.
 *
 * Plain objects are merged key by key rather than replaced, because tweakpane
 * bindings hold a reference to the object they were built against — swapping
 * it for a new object would leave every bound slider pointed at the orphan
 * and silently stop applying.
 *
 * Keys absent from the target are dropped: a save written before a system
 * gained or lost a field shouldn't graft the old shape back on.
 */
export function restoreProps(target: object, props: Record<string, unknown>) {
  const object = target as Record<string, unknown>;

  for (const [key, value] of Object.entries(props)) {
    if (SKIP.has(key)) continue;
    if (!(key in object)) continue;

    const current = object[key];

    if (
      current !== null &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      restoreProps(current, value as Record<string, unknown>);
      continue;
    }

    object[key] = value;
  }
}
