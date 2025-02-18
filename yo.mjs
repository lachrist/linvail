console.log(
  [4, , , , 1, , , 2, , 3].sort((...args) => {
    console.log(args);
    return String(args[0] - args[1]);
  }),
);
