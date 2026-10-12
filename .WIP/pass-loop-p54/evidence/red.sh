#!/usr/bin/env bash
# p54 red runs (AUTO-2, AUTO-3 red, AUTO-5): every mutation happens in a scratch copy of the product tree
# (no .git, no .WIP), never in the product. usage (product root): bash .WIP/pass-loop-p54/evidence/red.sh <scratch dir> <profiles dir>
set -u
PRODUCT="$(pwd)"; RED="$1"; PROFILES="$2"; STATE="$PRODUCT/.WIP/pass-loop-p54"; FEED="$STATE/wix/feed.xml"
rm -rf "$RED"; mkdir -p "$RED"
tar --exclude=./.git --exclude=./.WIP -cf - . | tar -xf - -C "$RED"
cd "$RED" || exit 2
sum() { sha256sum publications/index.html | cut -c1-16; }
run() { echo "\$ $*"; "$@" 2>&1; echo "exit $?"; }
echo "== scratch copy: $(find . -type f | wc -l) files; page $(sum)"
run node tools/blog-sync.mjs --from "$FEED" --check

echo "== A. a script tag planted in tools/blog/gpts-attention-1.html"
cp tools/blog/gpts-attention-1.html "$RED/../keep.html"
printf '<script>alert(1)</script>\n' >> tools/blog/gpts-attention-1.html
run node tools/blog-sync.mjs --from "$FEED" --check
run node tools/blog-sync.mjs --from "$FEED"
echo "page after the refused write: $(sum)"
cp "$RED/../keep.html" tools/blog/gpts-attention-1.html

echo "== A2. an attribute outside the format (onclick on a p)"
sed -i '1s/^<p>/<p onclick="x()">/' tools/blog/gpts-attention-1.html
run node tools/blog-sync.mjs --from "$FEED" --check
cp "$RED/../keep.html" tools/blog/gpts-attention-1.html

echo "== B. an orphan text file tools/blog/article-inconnu.html"
cp tools/blog/gpts-attention-1.html tools/blog/article-inconnu.html
run node tools/blog-sync.mjs --from "$FEED" --check
rm tools/blog/article-inconnu.html

echo "== C. a text file rewritten with CRLF line endings"
sed -i 's/$/\r/' tools/blog/gpts-attention-1.html
echo "CR bytes in the file: $(tr -cd '\r' < tools/blog/gpts-attention-1.html | wc -c)"
run node tools/blog-sync.mjs --from "$FEED" --check
cp "$RED/../keep.html" tools/blog/gpts-attention-1.html

echo "== D. fidelity: one word removed from l-ia-modifie-t-elle-deja-le-marche-du-travail.html, page regenerated"
sed -i '1s/ freelances,/,/' tools/blog/l-ia-modifie-t-elle-deja-le-marche-du-travail.html
run node tools/blog-sync.mjs --from "$FEED"
P54_ROOT="$RED" run node "$STATE/fidelity.mjs"

echo "== E. render against the 403ba6c page (old blog-sync output), served on 127.0.0.1:4174"
git -C "$PRODUCT" -c core.autocrlf=false show 403ba6c:publications/index.html > publications/index.html
python -m http.server 4174 --bind 127.0.0.1 --directory "$RED" > /dev/null 2>&1 &
SERVER=$!
sleep 2
cd "$PRODUCT" || exit 2
P48_BASE=http://127.0.0.1:4174 P48_PROFILES="$PROFILES" P54_NO_LOG=1 node .WIP/pass-loop-p54/evidence/render.mjs > "$STATE/evidence/render-red.txt" 2>&1
echo "render exit $? ; FAIL lines $(grep -c FAIL "$STATE/evidence/render-red.txt") ; $(tail -1 "$STATE/evidence/render-red.txt")"
kill $SERVER
