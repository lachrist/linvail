const __ARAN_itr = __LINVAIL_INTRINSIC__;
let __ARAN_par_this = this;
let __ARAN_par_import = (source) => import(source);
let __ARAN_par_import_meta = import.meta;
let __ARAN_var__apply,
  __ARAN_var__construct,
  __ARAN_var__capture,
  __ARAN_var__release,
  __ARAN_var__internalize,
  __ARAN_var__externalize,
  __ARAN_var__sanitizeClosure;
__ARAN_var__apply = __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["apply"];
__ARAN_var__construct =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["construct"];
__ARAN_var__capture =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["capture"];
__ARAN_var__release =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["release"];
__ARAN_var__internalize =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["internalize"];
__ARAN_var__externalize =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["externalize"];
__ARAN_var__sanitizeClosure =
  __ARAN_itr["aran.global"]["__LINVAIL_ADVICE__"]["sanitizeClosure"];
__ARAN_par_import = __ARAN_var__capture(
  __ARAN_var__internalize(__ARAN_par_import),
);
__ARAN_par_this = __ARAN_var__capture(__ARAN_var__internalize(__ARAN_par_this));
__ARAN_par_import_meta = __ARAN_var__capture(
  __ARAN_var__internalize(__ARAN_par_import_meta),
);
__ARAN_var__externalize(
  __ARAN_var__release(
    __ARAN_var__capture(
      __ARAN_var__internalize(
        await __ARAN_var__externalize(
          __ARAN_var__release(__ARAN_par_import(__ARAN_par_import_meta["url"])),
        ),
      ),
    ),
  ),
);
