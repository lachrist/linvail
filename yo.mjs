{
  const f = async function* f() {
    console.log({ this: this });
  };
  Reflect.apply(f, "foo", []).next();
}
