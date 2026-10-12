#!/bin/sh
# p51 round 2 (owner revision 2026-10-12 at the first look). Run from the product root: sh .WIP/pass-loop-p51/evidence/greps-r2.sh
# Supersedes the Venture half and the quote line of greps.sh. Last line R2 ok|FAIL (exit 1 on any mismatch).
bad=0
want() { if [ "$2" = "$3" ]; then echo "ok   $1 = $2"; else echo "FAIL $1 = $2 (want $3)"; bad=1; fi; }
C=contact/index.html
V=service-venture-building/index.html
S=assets/css/style.css
echo "== Contact ($C)"
want "removed texts (Done When 1)" "$(grep -c "Trois étapes\|deux minutes\|Me joindre directement\|Ce formulaire prépare\|Préparer mon email" $C)" 0
want "<h2>Coordonnées</h2>" "$(grep -c "<h2>Coordonnées</h2>" $C)" 1
want ">Envoyer</button>" "$(grep -c ">Envoyer</button>" $C)" 1
git diff --quiet a35c404 -- assets/js/forms.js; want "git diff --quiet a35c404 -- assets/js/forms.js exit" "$?" 0
want "quote gone (page)" "$(grep -c "blockquote\|Décrivez la situation" $C)" 0
want "quote rule gone (css)" "$(grep -c "^\.quote\|Citation" $S)" 0
want "contact list hook" "$(grep -c '<ul class="ticks ticks--contact">' $C)" 1
want "LinkedIn link inside the hooked list" "$(awk '/ticks--contact/{on=1} on&&/<\/ul>/{on=0} on' $C | grep -c 'href="https://www.linkedin.com/in/aymarddescorbiac"')" 1
want "visible link rule" "$(grep -c '^\.ticks--contact a { color: var(--teal-dark); text-decoration: underline;' $S)" 1
want "error line no longer reserves height" "$(grep -c '^\.field \.error { margin: 0; font-size: 0.82rem; color: var(--error); }$' $S)" 1
want "seven fields, seven error lines kept" "$(grep -c 'class="error" id="err-' $C)" 7
echo "== Venture ($V)"
h2=$(grep -o "<h2>[^<]*</h2>" $V | sed 's/<[^>]*>//g' | paste -sd'|' -)
want "h2 order" "$h2" "Kodak aurait pu créer Instagram|David + Goliath|Expériences associées|Réflexion|Pages|Contact"
want "removed texts" "$(grep -c 'Votre besoin\|Identifier des opportunités\|Pilotage\|class="disclosure\|Capitaliser sur vos actifs\|d.inspiration\|de transpiration\|service-question\|id="besoin"' $V)" 0
want "new subtitle" "$(grep -c -F "Les entreprises établies ont des actifs dormants pour créer des startups titans" $V)" 1
sec() { awk -v id="$1" '/<section/{on = index($0, "id=\"" id "\"") > 0} on' $V; }
want "QtzlMHaUGyM in #david-goliath (data-video + caption)" "$(sec david-goliath | grep -c QtzlMHaUGyM)" 2
want "7qO3G7tCHr8 in #reflexion (data-video + caption)" "$(sec reflexion | grep -c 7qO3G7tCHr8)" 2
want "QtzlMHaUGyM page-wide" "$(grep -c QtzlMHaUGyM $V)" 2
want "7qO3G7tCHr8 page-wide" "$(grep -c 7qO3G7tCHr8 $V)" 2
want "two h3 in #reflexion" "$(sec reflexion | grep -o '<h3>[^<]*</h3>' | paste -sd'|' -)" "<h3>Intérêts</h3>|<h3>Challenges</h3>"
want "ten points in #reflexion" "$(sec reflexion | grep -c '<li><strong>')" 10
want "no details/card/lead in #reflexion" "$(sec reflexion | grep -c '<details\|class="card\|class="lead')" 0
while IFS= read -r t; do
  want "kept: $t" "$(grep -c -F -- "$t" $V)" 1
done <<'EOF'
Vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »
Vidéo « corpangels Corporates — July23 »
Lire la vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »
Lire la vidéo « corpangels Corporates — July23 »
EOF
[ $bad = 0 ] && echo "R2 ok" || echo "R2 FAIL"
exit $bad
