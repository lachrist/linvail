const array = {
  _length: 0,
  set length(val) {
    console.log("length", { val });
  },
  set 0(val) {
    console.log(0, { val });
  },
};

Array.prototype.push.call(array, "foo", "bar");
