echo "Running bin tests..."

echo "Normal..."
node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "With identity module exclusion..."
LINVAIL_EXCLUDE='**/identity.mjs' node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "Without global dynamic code instrumentation..."
LINVAIL_GLOBAL_DYNAMIC_CODE=external node --import ./bin/setup.mjs ./test/bin/main.mjs

echo "With global object internalization..."
LINVAIL_GLOBAL_OBJECT=internal LINVAIL_EXCLUDE='' node --import ./bin/setup.mjs ./test/bin/main.mjs
