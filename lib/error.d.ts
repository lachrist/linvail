export type Console = {
  log: (message: string) => void;
  dir: (value: unknown) => void;
};
