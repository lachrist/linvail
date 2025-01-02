import { addSet, deleteSet, forEachSet, getSizeSet } from "../collection.mjs";

const { Set } = globalThis;

/**
 * @template E
 * @return {{
 *   emit: (
 *     event: E,
 *   ) => void,
 *   emitter: import("./emitter").Emitter<E>,
 * }}
 */
export const createEmitter = () => {
  /** @type {Set<(event: E) => void>} */
  const listeners = new Set();
  let empty = true;
  return {
    emit: (event) => {
      if (!empty) {
        forEachSet(listeners, (listener) => {
          listener(event);
        });
      }
    },
    emitter: {
      addListener: (listener) => {
        addSet(listeners, listener);
        empty = false;
      },
      removeListener: (listener) => {
        const success = deleteSet(listeners, listener);
        if (getSizeSet(listeners) === 0) {
          empty = true;
        }
        return success;
      },
    },
  };
};

/**
 * @template E
 * @template X1
 * @param {(
 *   part1: X1,
 * ) => E} makeEvent
 * @return {{
 *   emit: (
 *     part1: X1,
 *   ) => void,
 *   emitter: import("./emitter").Emitter<E>,
 * }}
 */
export const createEmitter1 = (makeEvent) => {
  /** @type {Set<(event: E) => void>} */
  const listeners = new Set();
  let empty = true;
  return {
    emit: (part1) => {
      if (!empty) {
        const event = makeEvent(part1);
        forEachSet(listeners, (listener) => {
          listener(event);
        });
      }
    },
    emitter: {
      addListener: (listener) => {
        addSet(listeners, listener);
        empty = false;
      },
      removeListener: (listener) => {
        const success = deleteSet(listeners, listener);
        if (getSizeSet(listeners) === 0) {
          empty = true;
        }
        return success;
      },
    },
  };
};

/**
 * @template E
 * @template X1
 * @template X2
 * @param {(
 *   part1: X1,
 *   part2: X2,
 * ) => E} makeEvent
 * @return {{
 *   emit: (
 *     part1: X1,
 *     part2: X2,
 *   ) => void,
 *   emitter: import("./emitter").Emitter<E>,
 * }}
 */
export const createEmitter2 = (makeEvent) => {
  /** @type {Set<(event: E) => void>} */
  const listeners = new Set();
  let empty = true;
  return {
    emit: (part1, part2) => {
      if (!empty) {
        const event = makeEvent(part1, part2);
        forEachSet(listeners, (listener) => {
          listener(event);
        });
      }
    },
    emitter: {
      addListener: (listener) => {
        addSet(listeners, listener);
        empty = false;
      },
      removeListener: (listener) => {
        const success = deleteSet(listeners, listener);
        if (getSizeSet(listeners) === 0) {
          empty = true;
        }
        return success;
      },
    },
  };
};

/**
 * @template E
 * @template X1
 * @template X2
 * @template X3
 * @param {(
 *   part1: X1,
 *   part2: X2,
 *   part3: X3,
 * ) => E} makeEvent
 * @return {{
 *   emit: (
 *     part1: X1,
 *     part2: X2,
 *     part3: X3,
 *   ) => void,
 *   emitter: import("./emitter").Emitter<E>,
 * }}
 */
export const createEmitter3 = (makeEvent) => {
  /** @type {Set<(event: E) => void>} */
  const listeners = new Set();
  let empty = true;
  return {
    emit: (part1, part2, part3) => {
      if (!empty) {
        const event = makeEvent(part1, part2, part3);
        forEachSet(listeners, (listener) => {
          listener(event);
        });
      }
    },
    emitter: {
      addListener: (listener) => {
        addSet(listeners, listener);
        empty = false;
      },
      removeListener: (listener) => {
        const success = deleteSet(listeners, listener);
        if (getSizeSet(listeners) === 0) {
          empty = true;
        }
        return success;
      },
    },
  };
};
