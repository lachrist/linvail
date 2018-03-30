const coefs = {a:1, b:6, c:9};
const delta = coefs.b * coefs.b - 4 * coefs.a * coefs.c;
if (delta < 0) {
  console.log("No Solution");
} else if (delta === 0) {
  console.log("Sol = " + (-coefs.b / 2 * coefs.a));
} else {
  const sol1 = (-coefs.b - Math.sqrt(delta) / 2 * coefs.a);
  const sol2 = (-coefs.b + Math.sqrt(delta) / 2 * coefs.a);
  console.log("Sol1 = "+sol1+", Sol2 = "+sol2);
}