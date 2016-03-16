
node ./glitterdust/run.js \
  --mode demo \
  --out ./linvail/glitterdust/demo.html \
  --instrument ./linvail/glitterdust/main.js \
  --masters ./linvail/glitterdust/analyses \
  --targets ./benchmark/sample

node ./glitterdust/run.js \
  --mode batch \
  --out ./linvail/glitterdust/batch-atom.html \
  --instrument ./linvail/glitterdust/main.js \
  --masters ./linvail/glitterdust/analyses \
  --targets ./benchmark/atom

node ./glitterdust/run.js \
  --mode batch \
  --out ./linvail/glitterdust/batch-sunspider.html \
  --instrument ./linvail/glitterdust/main.js \
  --masters ./linvail/glitterdust/analyses \
  --targets ./benchmark/sunspider-1.0.2
