echo "Running lib test..";

echo "test util...";
npx c8 --include lib/util -- node lib/util/_.test.mjs

echo "test instrument...";
node lib/instrument/_.test.mjs
npx c8 \
  --include lib/instrument \
  --exclude lib/instrument/_.test.mjs \
  --exclude lib/instrument/_.test.inst.mjs \
  -- node test/lib/deploy.mjs lib/instrument/_.test.mjs

echo "test runtime/region...";
node lib/runtime/region/_.test.mjs
npx c8 \
  --include lib/runtime/region \
  --exclude lib/runtime/region/_.test.mjs \
  --exclude lib/runtime/region/_.test.inst.mjs \
  -- node test/lib/deploy.mjs lib/runtime/region/_.test.mjs

echo "test runtime/library...";
npx c8 \
  --include lib/runtime/library.mjs \
  -- node test/lib/deploy.mjs lib/runtime/library.test.mjs
