echo "Running bin tests..."

echo "Normal..."
node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "With identity module exclusion..."
LINVAIL_EXCLUDE='**/identity.mjs' node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "With global dynamic code instrumentation..."
LINVAIL_INSTRUMENT_GLOBAL_DYNAMIC_CODE=0 node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "With global object internalization..."
LINVAIL_GLOBAL=internal node --import ./bin/setup.mjs ./test/bin/main.mjs
