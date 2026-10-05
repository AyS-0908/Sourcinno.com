#!/usr/bin/env bash
# p27 mutation ledger: every mutation runs on a throwaway copy of a scratch tree, never on the product tree.
SP="$(cd "$(dirname "$0")" && pwd)"
run() { # name tree file sed-expr flags...
  local name="$1" tree="$2" file="$3" expr="$4"; shift 4
  rm -rf "$SP/mut"; cp -r "$SP/$tree" "$SP/mut"
  if [ "$expr" = "APPEND_THROW" ]; then printf '\nthrow new Error("p27 mutation");\n' >> "$SP/mut/$file"
  else sed -i "$expr" "$SP/mut/$file"; fi
  local changed=yes; cmp -s "$SP/$tree/$file" "$SP/mut/$file" && changed="NO (file already in the mutated state)"
  [ "$file" = "assets/js/forms.js" ] && (cd "$SP/mut" && node tools/version.mjs >/dev/null)
  (cd "$SP/mut" && node tools/check.mjs "$@" > "$SP/mut-out.txt" 2>&1); local code=$?
  echo "$name | $tree | check.mjs $* | file changed: $changed | exit=$code"
  grep -E '^\s+- ' "$SP/mut-out.txt" | cut -c1-230
  rm -rf "$SP/mut"
}
for t in old new; do
  run M1a $t tools/portfolio.test.mjs APPEND_THROW --all
  run M1b $t tools/test-ia-embeds.mjs APPEND_THROW --all
  run M2  $t politique-confidentialite/index.html 's/cdn\.jsdelivr\.net/un reseau de diffusion/g' --tiers
  run M3  $t contact/index.html 's/ data-contact-form novalidate hidden>/ data-contact-form novalidate>/' --forms --nojs
done
run M4 new contact/index.html 's/data-form-fallback data-state="ok">/data-form-fallback data-state="ok" hidden>/' --forms --nojs
run M5 new assets/js/forms.js '/form\.hidden = false;/d' --forms --nojs
