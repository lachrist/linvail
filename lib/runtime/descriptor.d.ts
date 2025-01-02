export type DefineDescriptor<D, A> = {
  __proto__?: null;
  value?: D;
  writable?: boolean;
  get?: A | undefined;
  set?: A | undefined;
  configurable?: boolean;
  enumerable?: boolean;
};

export type DataDescriptor<D> = {
  value: D;
  configurable: boolean;
  writable: boolean;
  enumerable: boolean;
};

export type AccessorDescriptor<A> = {
  get: A | undefined;
  set: A | undefined;
  configurable: boolean;
  enumerable: boolean;
};

export type Descriptor<D, A> = DataDescriptor<D> | AccessorDescriptor<A>;
