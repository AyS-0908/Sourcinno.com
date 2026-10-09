#!/usr/bin/env bash
# p40 mutation ledger. Each case: fresh copy of the product working tree (tar, .git and .WIP excluded, bytes unchanged),
# one mutation, one command, expected exit code (+ expected text when given). Usage: bash mutations.sh
SRC="C:/Users/aymar/AYS_CODING/code-SOURCINNO_WWW/current sourcinno site- code"
SCR="C:/Users/aymar/AppData/Local/Temp/claude/C--Users-aymar-AYS-CODING-code-SOURCINNO-WWW/c642341b-8223-4fd0-8bff-ba4c56d46306/scratchpad/p40/mut"
pass=0; failn=0
fresh() { rm -rf "$SCR/c"; mkdir -p "$SCR/c"; (cd "$SRC" && tar --exclude=./.WIP --exclude=./.git -cf - .) | tar -x -C "$SCR/c"; }
run() { # name expected-exit grep-text command...
  local name="$1" want="$2" text="$3"; shift 3
  local out; out=$(cd "$SCR/c" && "$@" 2>&1); local got=$?
  local ok=1; [ "$got" = "$want" ] || ok=0
  if [ -n "$text" ] && ! grep -qF -- "$text" <<<"$out"; then ok=0; fi
  if [ $ok = 1 ]; then pass=$((pass+1)); echo "PASS $name -> exit $got${text:+ « $text »}"; else failn=$((failn+1)); echo "FAIL $name -> exit $got (want $want${text:+, « $text »})"; echo "$out" | grep -E "^  - |ECHEC" | head -5; fi
}
fresh; run m0-unmodified 0 "" node tools/check.mjs --all
fresh; printf '.ghost-class { color: red; }\n' >> "$SCR/c/assets/css/style.css"
(cd "$SCR/c" && node tools/version.mjs >/dev/null); run m1-ghost-rule 1 "ghost-class" node tools/check.mjs --all
printf 'const ghost = "ghost-class";\n' >> "$SCR/c/assets/js/_v2/chat.js"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m2-ghost-in-v2-js 0 "" node tools/check.mjs --all
fresh; sed -i '0,/<main id="main">/s//<main id="main"><p class='"'"'btn--nowhere'"'"'>x<\/p>/' "$SCR/c/mentions-legales/index.html"; run m3-single-quoted-class 1 "btn--nowhere" node tools/check.mjs --all
fresh; printf 'const zz = "chat-msg--bot";\n' >> "$SCR/c/assets/js/_v2/chat.js"; run m4-allowlisted-used-again 1 "chat-msg--bot" node tools/check.mjs
fresh; sed -i 's|"chat-msg chat-msg--" + who|"chat-msg chat-msg-" + "-" + who|' "$SCR/c/assets/js/_v2/chat.js"; run m5-allowlist-motif-gone 1 "perimee" node tools/check.mjs
fresh; sed -i 's|^  const SANS_REGLE = new Map(\[$|  const SANS_REGLE = new Map([["zz-x", "tools/shell/header.html"],|' "$SCR/c/tools/check.mjs"; sed -i 's|^        <li><a href="/publications/">|        <li class="zz-x"><a href="/publications/">|' "$SCR/c/tools/shell/header.html"; (cd "$SCR/c" && node tools/shell.mjs >/dev/null)
run m6a-sans-regle-entry-valid 0 "" node tools/check.mjs
printf '.zz-x { color: inherit; }\n' >> "$SCR/c/assets/css/style.css"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m6b-sans-regle-gains-rule 1 "zz-x" node tools/check.mjs
fresh; sed -i '0,/<style>/s//<style>.zz-dead-page { color: red; }/' "$SCR/c/contact/index.html"; run m7-dead-class-in-page-style 1 "zz-dead-page" node tools/check.mjs
fresh; printf '.zz-comment { color: red; }\n' >> "$SCR/c/assets/css/style.css"; printf '// zz-comment\n/* zz-comment */\n' >> "$SCR/c/assets/js/site.js"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m8-class-only-in-js-comment 1 "zz-comment" node tools/check.mjs
fresh; printf '.zz-js { color: red; }\n' >> "$SCR/c/assets/css/style.css"; printf 'document.body.classList.add("zz-js");\n' >> "$SCR/c/assets/js/site.js"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m9-class-set-by-js-string 0 "" node tools/check.mjs
fresh; sed -i 's|  background: rgba(221, 107, 32, 0.12);|  background: rgba(221, 107, 32, 0.9);|' "$SCR/c/assets/css/style.css"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m10-tag-background-darker 1 "etiquette technique" node tools/check.mjs --a11y
fresh; sed -i 's|  --tag-text:           #a04a12;|  --tag-text:           #d08050;|' "$SCR/c/assets/css/style.css"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m11-tag-token-lighter 1 "etiquette technique" node tools/check.mjs --a11y
fresh; sed -i 's|^\.hero--venture  .*$||' "$SCR/c/assets/css/style.css"; (cd "$SCR/c" && node tools/version.mjs >/dev/null); run m12-hero-rule-removed 1 "hero--venture" node tools/check.mjs
echo "TOTAL: $pass PASS, $failn FAIL"
