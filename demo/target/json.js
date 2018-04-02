let o1 = {foo:"bar"};
let s = JSON.stringify(o1);
let o2 = JSON.parse(s);
o2.foo;