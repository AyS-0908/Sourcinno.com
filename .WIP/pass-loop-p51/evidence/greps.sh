#!/bin/sh
# p51 Done When 1-2 greps. Run from the product root: sh .WIP/pass-loop-p51/evidence/greps.sh
# Prints each count; last line DW12 ok|FAIL (exit 1 on any mismatch).
bad=0
want() { if [ "$2" = "$3" ]; then echo "ok   $1 = $2"; else echo "FAIL $1 = $2 (want $3)"; bad=1; fi; }
C=contact/index.html
V=service-venture-building/index.html
echo "== Done When 1 ($C)"
want "removed texts" "$(grep -c "Trois étapes\|deux minutes\|Me joindre directement\|Ce formulaire prépare\|Préparer mon email" $C)" 0
want "<h2>Coordonnées</h2>" "$(grep -c "<h2>Coordonnées</h2>" $C)" 1
want ">Envoyer</button>" "$(grep -c ">Envoyer</button>" $C)" 1
git diff --quiet a35c404 -- assets/js/forms.js; want "git diff --quiet a35c404 -- assets/js/forms.js exit" "$?" 0
echo "== Done When 2 ($V)"
h2=$(grep -o "<h2>[^<]*</h2>" $V | sed 's/<[^>]*>//g' | paste -sd'|' -)
want "h2 order" "$h2" "Kodak aurait pu créer Instagram|David + Goliath|Expériences associées|Votre besoin &gt; Livrables|Pages|Contact"
want "removed texts" "$(grep -c 'Réflexion\|Pilotage\|class="disclosure\|Capitaliser sur vos actifs' $V)" 0
want "new subtitle" "$(grep -c -F "Les entreprises établies ont des actifs dormants pour créer des startups titans" $V)" 1
# section-scoped: the lines between a section's opening tag and the next section opening tag
sec() { awk -v id="$1" '/<section/{on = index($0, "id=\"" id "\"") > 0} on' $V; }
want "QtzlMHaUGyM in #david-goliath (data-video + caption)" "$(sec david-goliath | grep -c QtzlMHaUGyM)" 2
want "7qO3G7tCHr8 in #besoin (data-video + caption)" "$(sec besoin | grep -c 7qO3G7tCHr8)" 2
want "QtzlMHaUGyM page-wide" "$(grep -c QtzlMHaUGyM $V)" 2
want "7qO3G7tCHr8 page-wide" "$(grep -c 7qO3G7tCHr8 $V)" 2
while IFS= read -r t; do
  want "kept: $t" "$(grep -c -F -- "$t" $V)" 1
done <<'EOF'
Identifier des opportunités réalistes et pertinentes &rarr; les expérimenter en mode startup.
<h3>Stratégie</h3>
10% d'inspiration
<h3>Création</h3>
90% de transpiration
Explorer les opportunités
Valider avec les utilisateurs
Construire le business plan
Organiser la création
💡 Quoi : produit ou service autour de notre cœur de métier (complémenteur, amont-aval, substitut) ? Quels actifs opérationnels peuvent être mutualisés à faible coût (compétences, base installée, outils) ?
☑️ Qui : prototype jetable ou validation auprès d'utilisateurs bêta ?
🚀 Où : business plan ?
🛠️ Comment : plan de mise en œuvre, équipes, fournisseurs et outils ?
Vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »
Vidéo « corpangels Corporates — July23 »
Lire la vidéo « CorpAngels : TechnoService SaaS pour création de StartUps »
Lire la vidéo « corpangels Corporates — July23 »
EOF
# kept texts must sit inside #besoin (structured text) except captions/labels already scoped above
for t in "Explorer les opportunités" "Valider avec les utilisateurs" "Construire le business plan" "Organiser la création" "🛠️ Comment"; do
  want "in #besoin: $t" "$(sec besoin | grep -c -F -- "$t")" 1
done
want "no details in #besoin" "$(sec besoin | grep -c '<details')" 0
want "no card in #besoin" "$(sec besoin | grep -c 'class="card')" 0
[ $bad = 0 ] && echo "DW12 ok" || echo "DW12 FAIL"
exit $bad
