#!/usr/bin/env bash
# p57 red runs (AUTO-2 red, AUTO-4), adapted from .WIP/pass-loop-p54/evidence/red.sh: every mutation happens in a
# scratch copy of the product tree (no .git, no .WIP), never in the product. The tool did not change in this Pass:
# its refusals (script tag, orphan file, CRLF) were proven in Pass 54 and are not replayed here.
# usage (product root): bash .WIP/pass-loop-p57/evidence/red.sh <scratch dir> <profiles dir>
set -u
PRODUCT="$(pwd)"; RED="$1"; PROFILES="$2"; STATE="$PRODUCT/.WIP/pass-loop-p57"; FEED="$STATE/wix/feed.xml"
rm -rf "$RED"; mkdir -p "$RED"
tar --exclude=./.git --exclude=./.WIP -cf - . | tar -xf - -C "$RED"
cd "$RED" || exit 2
sum() { sha256sum publications/index.html | cut -c1-16; }
run() { echo "\$ $*"; "$@" 2>&1; echo "exit $?"; }
echo "== scratch copy: $(find . -type f | wc -l) files; page $(sum)"
run node tools/blog-sync.mjs --from "$FEED" --check
P57_ROOT="$RED" run node "$STATE/fidelity.mjs"

echo "== D. fidelity: one word removed (« finalement ») from tools/blog/todo-startup-structure-at-minimum.html, page regenerated"
grep -c ' finalement ' tools/blog/todo-startup-structure-at-minimum.html
sed -i 's/ consiste finalement / consiste /' tools/blog/todo-startup-structure-at-minimum.html
run node tools/blog-sync.mjs --from "$FEED"
P57_ROOT="$RED" run node "$STATE/fidelity.mjs"

echo "== E. render against the 6438148 page (the four posts still Wix cards), served on 127.0.0.1:4174"
git -C "$PRODUCT" -c core.autocrlf=false show 6438148:publications/index.html > publications/index.html
python -m http.server 4174 --bind 127.0.0.1 --directory "$RED" > /dev/null 2>&1 &
SERVER=$!
sleep 2
cd "$PRODUCT" || exit 2
P48_BASE=http://127.0.0.1:4174 P48_PROFILES="$PROFILES" P57_NO_LOG=1 node .WIP/pass-loop-p57/evidence/render.mjs > "$STATE/evidence/render-red.txt" 2>&1
echo "render exit $? ; FAIL lines $(grep -c FAIL "$STATE/evidence/render-red.txt") ; $(tail -1 "$STATE/evidence/render-red.txt")"
kill $SERVER
