// const arr = {
//   __proto__: {
//     __proto__: null,
//     0: undefined,
//   },
//   length: 3,
//   1: "bar",
// };

// console.log(Array.prototype.map.call(arr, (...args) => args));

const array = [1, 2, 3, 4, 5, 6];

console.log(
  array.map((...args) => {
    array.pop();
    return args;
  }).length,
);
