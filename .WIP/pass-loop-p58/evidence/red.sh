#!/usr/bin/env bash
# p58 red runs (AUTO-2, AUTO-3 red, AUTO-1 style clause red, AUTO-5), adapted from .WIP/pass-loop-p57/evidence/red.sh:
# every mutation happens in a scratch copy of the committed product tree (git archive with the original bytes, no
# .git, no .WIP), never in the product.
# usage (product root, product committed): bash .WIP/pass-loop-p58/evidence/red.sh <scratch dir> <profiles dir>
set -u
PRODUCT="$(pwd)"; RED="$1"; PROFILES="$2"; STATE="$PRODUCT/.WIP/pass-loop-p58"; FEED="$STATE/wix/feed.xml"
FILE=tools/blog/sourcinno-startupstudiotypes.html
rm -rf "$RED"; mkdir -p "$RED" "$RED.keep"
git -c core.autocrlf=false archive HEAD -- . ':(exclude).WIP' | tar -xf - -C "$RED"
cd "$RED" || exit 2
cp tools/blog-sync.mjs "$RED.keep/blog-sync.mjs"; cp "$FILE" "$RED.keep/article.html"; cp assets/css/style.css "$RED.keep/style.css"
run() { echo "\$ $*"; "$@" 2>&1 | cut -c1-300; echo "exit ${PIPESTATUS[0]}"; }
echo "== scratch copy of $(git -C "$PRODUCT" rev-parse --short HEAD): $(find . -type f | wc -l) files"
run node tools/blog-sync.test.mjs
run node tools/blog-sync.mjs --from "$FEED" --check

echo "== A. each table line of FORMAT removed in turn from the scratch tool: the test must exit 1"
for n in 0 1 2 3; do
  cp "$RED.keep/blog-sync.mjs" tools/blog-sync.mjs
  node "$STATE/evidence/mutate.mjs" tools/blog-sync.mjs $n
  node tools/blog-sync.test.mjs > "$RED.keep/out.txt" 2>&1; code=$?
  echo "exit $code ; FAIL lines $(grep -c '^FAIL' "$RED.keep/out.txt") ; $(grep '^FAIL' "$RED.keep/out.txt" | head -1 | cut -c1-260)"
done
cp "$RED.keep/blog-sync.mjs" tools/blog-sync.mjs
run node tools/blog-sync.test.mjs

echo "== B. a tag outside the format planted in the scratch copy of the new text file: --check must exit 1 naming the file"
for plant in '<td style="color:red">x</td>' '<table class="x"></table>' '<td onclick="x()">x</td>' '<script>alert(1)</script>'; do
  cp "$RED.keep/article.html" "$FILE"; printf '%s\n' "$plant" >> "$FILE"
  echo "planted: $plant"
  run node tools/blog-sync.mjs --from "$FEED" --check
done
cp "$RED.keep/article.html" "$FILE"

echo "== C. fidelity: one word of a table cell removed (« honoraires »), page regenerated"
grep -c 'facturant des honoraires' "$FILE"
sed -i 's/ facturant des honoraires/ facturant des/' "$FILE"
run node tools/blog-sync.mjs --from "$FEED"
P58_ROOT="$RED" run node "$STATE/fidelity.mjs"
cp "$RED.keep/article.html" "$FILE"
run node tools/blog-sync.mjs --from "$FEED"
P58_ROOT="$RED" run node "$STATE/fidelity.mjs"

echo "== D. style clause: a rule outside a table appended, then an existing line removed, in the scratch style sheet"
cd "$PRODUCT" || exit 2
run node "$STATE/evidence/css-added.mjs" 7cff339 "$RED/assets/css/style.css"
printf '.blog-body p { color: red; }\n' >> "$RED/assets/css/style.css"
run node "$STATE/evidence/css-added.mjs" 7cff339 "$RED/assets/css/style.css"
cp "$RED.keep/style.css" "$RED/assets/css/style.css"; sed -i '/^\.blog-body li + li /d' "$RED/assets/css/style.css"
run node "$STATE/evidence/css-added.mjs" 7cff339 "$RED/assets/css/style.css"
cp "$RED.keep/style.css" "$RED/assets/css/style.css"

echo "== E. render against the 7cff339 page (the post still a Wix card), served on 127.0.0.1:4174"
git -c core.autocrlf=false show 7cff339:publications/index.html > "$RED/publications/index.html"
python -m http.server 4174 --bind 127.0.0.1 --directory "$RED" > /dev/null 2>&1 &
SERVER=$!
sleep 2
P48_BASE=http://127.0.0.1:4174 P48_PROFILES="$PROFILES" P58_NO_LOG=1 node .WIP/pass-loop-p58/evidence/render.mjs > "$STATE/evidence/render-red.txt" 2>&1
echo "render exit $? ; FAIL lines $(grep -c FAIL "$STATE/evidence/render-red.txt") ; $(tail -1 "$STATE/evidence/render-red.txt")"
kill $SERVER
