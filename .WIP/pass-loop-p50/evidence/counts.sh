#!/bin/sh
# P50 Done When 2: each count printed by the coherence note vs git grep -o -F on the same files.
# Run from the product root. Files = the 16 pages check.mjs reads + assets/js/*.js top level.
set -e
FILES=$(git ls-files '*.html' | grep -v -E '^(\.WIP|tools|\.github)/'; ls assets/js/*.js)
echo "files: $(echo "$FILES" | wc -l) ($(echo "$FILES" | grep -c '\.html$') html)"
for v in 'aymard.de.scorbiac@sourcinno.com' '+33608755877' '+33 6 08 75 58 77' '+33&nbsp;6&nbsp;08&nbsp;75&nbsp;58&nbsp;77' '+37064503378' '+370&nbsp;645&nbsp;03378' 'linkedin.com/in/aymarddescorbiac' 'data-video="' 'youtube.com/watch?v=' 'https://typebot.io/' "typebot: '"; do
  n=$(echo "$FILES" | tr '\n' '\0' | xargs -0 git grep -o -F -e "$v" -- 2>/dev/null | wc -l)
  echo "git grep -o -F '$v' = $n"
done
echo "host phone files: $(echo "$FILES" | tr '\n' '\0' | xargs -0 git grep -l -F -e '+37064503378' -- | tr '\n' ' ')"
