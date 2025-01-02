export type Emitter<E> = {
  addListener: (listener: (event: E) => void) => void;
  removeListener: (listener: (event: E) => void) => boolean;
};
