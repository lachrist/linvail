const __ARAN_itr = __LINVAIL_INTRINSIC__;
let __ARAN_par_this = this;
let __ARAN_par_import = (source) => import(source);
let __ARAN_par_import_meta = import.meta;
let __ARAN_var__apply,
  __ARAN_var__construct,
  __ARAN_var__enterValue,
  __ARAN_var__leaveValue,
  __ARAN_var__enterClosure,
  __ARAN_var__leaveBranch,
  __ARAN_var__enterPrimitive,
  __ARAN_var__enterArgumentList,
  __ARAN_var__enterNewTarget,
  __ARAN_var__enterPlainExternalReference,
  __ARAN_var__w_1110;
__ARAN_var__apply = __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["apply"];
__ARAN_var__construct =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["construct"];
__ARAN_var__enterValue =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["enterValue"];
__ARAN_var__leaveValue =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["leaveValue"];
__ARAN_var__enterClosure =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["enterClosure"];
__ARAN_var__leaveBranch =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["leaveBranch"];
__ARAN_var__enterPrimitive =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["enterPrimitive"];
__ARAN_var__enterArgumentList =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["enterArgumentList"];
__ARAN_var__enterNewTarget =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["enterNewTarget"];
__ARAN_var__enterPlainExternalReference =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"][
    "enterPlainExternalReference"
  ];
__ARAN_par_this = __ARAN_var__enterPrimitive(__ARAN_par_this);
__ARAN_par_import = __ARAN_var__enterPlainExternalReference(__ARAN_par_import);
__ARAN_par_import_meta = __ARAN_var__enterPlainExternalReference(
  __ARAN_par_import_meta,
);
__ARAN_var__w_1110 = __ARAN_var__enterPrimitive(__ARAN_var__w_1110);
{
  let __ARAN_var_g = __ARAN_itr["aran.deadzone"],
    __ARAN_var_i = __ARAN_itr["aran.deadzone"],
    __ARAN_var__w_3233210 = __ARAN_itr["aran.deadzone"];
  __ARAN_var_g = __ARAN_var__enterPrimitive(__ARAN_var_g);
  __ARAN_var_i = __ARAN_var__enterPrimitive(__ARAN_var_i);
  __ARAN_var__w_3233210 = __ARAN_var__enterPrimitive(__ARAN_var__w_3233210);
  __ARAN_var_g =
    ((__ARAN_var__w_3233210 = __ARAN_var__enterClosure(function* (
      ...{
        [__ARAN_itr["Symbol"]("fresh-key")]: {
          ["function.arguments"]: __ARAN_par_function_arguments,
          ["new.target"]: __ARAN_par_new_target,
          ["this"]: __ARAN_par_this,
          [".r.32332610"]: __ARAN_var__r_32332610,
          ["arguments"]: __ARAN_var_arguments,
        } = {
          "__proto__": null,
          "function.arguments": __ARAN_itr["Array.from"](arguments),
          "new.target": void null,
          "this": this,
          ".r.32332610": __ARAN_itr["aran.deadzone"],
        },
        [__ARAN_itr["Symbol"]("fresh-key")]: {} = (__ARAN_var__leaveBranch(
          __ARAN_par_new_target,
        )
          ? (__ARAN_par_this = __ARAN_var__apply(
              __ARAN_var__enterValue(__ARAN_itr["Object.create"]),
              __ARAN_var__enterValue(__ARAN_itr["undefined"]),
              [
                ((__ARAN_var__r_32332610 = __ARAN_var__apply(
                  __ARAN_var__enterValue(__ARAN_itr["aran.get"]),
                  __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                  [
                    __ARAN_par_new_target,
                    __ARAN_var__enterPrimitive("prototype"),
                  ],
                )),
                __ARAN_var__leaveBranch(
                  __ARAN_var__leaveBranch(
                    __ARAN_var__apply(
                      __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                      [
                        __ARAN_var__enterPrimitive("==="),
                        __ARAN_var__apply(
                          __ARAN_var__enterValue(__ARAN_itr["aran.unary"]),
                          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                          [
                            __ARAN_var__enterPrimitive("typeof"),
                            __ARAN_var__r_32332610,
                          ],
                        ),
                        __ARAN_var__enterPrimitive("object"),
                      ],
                    ),
                  )
                    ? __ARAN_var__apply(
                        __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                        __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                        [
                          __ARAN_var__enterPrimitive("!=="),
                          __ARAN_var__r_32332610,
                          __ARAN_var__enterPrimitive(null),
                        ],
                      )
                    : __ARAN_var__apply(
                        __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                        __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                        [
                          __ARAN_var__enterPrimitive("==="),
                          __ARAN_var__apply(
                            __ARAN_var__enterValue(__ARAN_itr["aran.unary"]),
                            __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                            [
                              __ARAN_var__enterPrimitive("typeof"),
                              __ARAN_var__r_32332610,
                            ],
                          ),
                          __ARAN_var__enterPrimitive("function"),
                        ],
                      ),
                )
                  ? __ARAN_var__r_32332610
                  : __ARAN_var__enterValue(__ARAN_itr["Object.prototype"])),
              ],
            ))
          : void null,
        (__ARAN_var_arguments = __ARAN_var__apply(
          __ARAN_var__enterValue(__ARAN_itr["aran.toArgumentList"]),
          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
          [__ARAN_par_function_arguments, __ARAN_var__enterPrimitive(null)],
        )),
        {}),
      }
    ) {
      __ARAN_par_new_target = __ARAN_var__enterNewTarget(__ARAN_par_new_target);
      __ARAN_par_function_arguments = __ARAN_var__enterArgumentList(
        __ARAN_par_function_arguments,
      );
      __ARAN_var__r_32332610 = __ARAN_var__enterPrimitive(
        __ARAN_var__r_32332610,
      );
      __ARAN_var_arguments = __ARAN_var__enterPrimitive(__ARAN_var_arguments);
      {
      }
      return __ARAN_var__leaveValue(
        __ARAN_var__leaveBranch(__ARAN_par_new_target)
          ? __ARAN_var__leaveBranch(
              __ARAN_var__leaveBranch(
                __ARAN_var__apply(
                  __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                  __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                  [
                    __ARAN_var__enterPrimitive("==="),
                    __ARAN_var__apply(
                      __ARAN_var__enterValue(__ARAN_itr["aran.unary"]),
                      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                      [
                        __ARAN_var__enterPrimitive("typeof"),
                        __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                      ],
                    ),
                    __ARAN_var__enterPrimitive("object"),
                  ],
                ),
              )
                ? __ARAN_var__apply(
                    __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                    __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                    [
                      __ARAN_var__enterPrimitive("!=="),
                      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                      __ARAN_var__enterPrimitive(null),
                    ],
                  )
                : __ARAN_var__apply(
                    __ARAN_var__enterValue(__ARAN_itr["aran.binary"]),
                    __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                    [
                      __ARAN_var__enterPrimitive("==="),
                      __ARAN_var__apply(
                        __ARAN_var__enterValue(__ARAN_itr["aran.unary"]),
                        __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                        [
                          __ARAN_var__enterPrimitive("typeof"),
                          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
                        ],
                      ),
                      __ARAN_var__enterPrimitive("function"),
                    ],
                  ),
            )
            ? __ARAN_var__enterValue(__ARAN_itr["undefined"])
            : __ARAN_par_this
          : __ARAN_var__enterValue(__ARAN_itr["undefined"]),
      );
    })),
    __ARAN_var__apply(
      __ARAN_var__enterValue(__ARAN_itr["Reflect.defineProperty"]),
      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
      [
        __ARAN_var__w_3233210,
        __ARAN_var__enterPrimitive("length"),
        __ARAN_var__apply(
          __ARAN_var__enterValue(__ARAN_itr["aran.createObject"]),
          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
          [
            __ARAN_var__enterPrimitive(null),
            __ARAN_var__enterPrimitive("value"),
            __ARAN_var__enterPrimitive(0),
            __ARAN_var__enterPrimitive("writable"),
            __ARAN_var__enterPrimitive(false),
            __ARAN_var__enterPrimitive("enumerable"),
            __ARAN_var__enterPrimitive(false),
            __ARAN_var__enterPrimitive("configurable"),
            __ARAN_var__enterPrimitive(true),
          ],
        ),
      ],
    ),
    __ARAN_var__apply(
      __ARAN_var__enterValue(__ARAN_itr["Reflect.defineProperty"]),
      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
      [
        __ARAN_var__w_3233210,
        __ARAN_var__enterPrimitive("name"),
        __ARAN_var__apply(
          __ARAN_var__enterValue(__ARAN_itr["aran.createObject"]),
          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
          [
            __ARAN_var__enterPrimitive(null),
            __ARAN_var__enterPrimitive("value"),
            __ARAN_var__enterPrimitive("g"),
            __ARAN_var__enterPrimitive("writable"),
            __ARAN_var__enterPrimitive(false),
            __ARAN_var__enterPrimitive("enumerable"),
            __ARAN_var__enterPrimitive(false),
            __ARAN_var__enterPrimitive("configurable"),
            __ARAN_var__enterPrimitive(true),
          ],
        ),
      ],
    ),
    __ARAN_var__apply(
      __ARAN_var__enterValue(__ARAN_itr["Reflect.defineProperty"]),
      __ARAN_var__enterValue(__ARAN_itr["undefined"]),
      [
        __ARAN_var__w_3233210,
        __ARAN_var__enterPrimitive("prototype"),
        __ARAN_var__apply(
          __ARAN_var__enterValue(__ARAN_itr["aran.createObject"]),
          __ARAN_var__enterValue(__ARAN_itr["undefined"]),
          [
            __ARAN_var__enterPrimitive(null),
            __ARAN_var__enterPrimitive("value"),
            __ARAN_var__apply(
              __ARAN_var__enterValue(__ARAN_itr["Object.create"]),
              __ARAN_var__enterValue(__ARAN_itr["undefined"]),
              [
                __ARAN_var__enterValue(
                  __ARAN_itr["aran.GeneratorFunction.prototype.prototype"],
                ),
              ],
            ),
            __ARAN_var__enterPrimitive("writable"),
            __ARAN_var__enterPrimitive(true),
            __ARAN_var__enterPrimitive("enumerable"),
            __ARAN_var__enterPrimitive(false),
            __ARAN_var__enterPrimitive("configurable"),
            __ARAN_var__enterPrimitive(false),
          ],
        ),
      ],
    ),
    __ARAN_var__w_3233210);
  __ARAN_var_i = __ARAN_var__apply(
    __ARAN_var_g,
    __ARAN_var__enterValue(__ARAN_itr["undefined"]),
    [],
  );
}
__ARAN_var__leaveValue(__ARAN_var__w_1110);
