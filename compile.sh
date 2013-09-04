cd $(dirname $0)

java -jar compiler.jar \
  --js pv-menu.js \
  --js_output_file pv-menu.min.js \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --externs externs/jquery-1.9.js \
  --warning_level VERBOSE \
  # --formatting PRETTY_PRINT
