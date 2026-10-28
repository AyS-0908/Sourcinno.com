# Pass 66 mutation ledger. Run from the product root. Each mutation in place, restored byte-identical.
LOG="$1"; : > "$LOG"
mut() { # file python-expr flags label
  f="$1"; before=$(sha256sum "$f"|cut -c1-16); cp "$f" /tmp/m66.bak
  python -c "import sys;p=sys.argv[1];s=open(p,encoding='utf-8',newline='').read();n=$2;assert n!=s,'no change';open(p,'w',encoding='utf-8',newline='').write(n)" "$f" || { echo "MUTATION NOT APPLIED $4" >> "$LOG"; return; }
  node tools/check.mjs $3 > /tmp/m66.out 2>&1; e=$?
  cp /tmp/m66.bak "$f"; after=$(sha256sum "$f"|cut -c1-16)
  { echo "== $4: check.mjs $3 exit=$e; restored sha $before -> $after"; grep -E "^\s+- " /tmp/m66.out | grep -v "coquille:" | cut -c1-260; echo "   (+ $(grep -c 'coquille:' /tmp/m66.out) coquille line(s))"; } >> "$LOG"
}
mut tools/shell/footer.html "s.replace('<li><a href=\"https://www.linkedin.com','<li><a href=\"tel:+33608755877\">+33 6 08 75 58 77</a></li>\n          <li><a href=\"https://www.linkedin.com',1)" "" "(a) mobile back in footer partial"
mut mentions-legales/index.html "s.replace('contact@sourcinno.com</a></li>\n    </ul>','contact@sourcinno.com</a> &mdash; <a href=\"tel:+33608755877\">+33 6 08 75 58 77</a></li>\n    </ul>',1)" "" "(b) mobile back in Mentions Contact line"
mut mentions-legales/index.html "__import__('re').sub(r'(<h2>Hébergement</h2>[\s\S]*?)<a href=\"tel:[^\"]*\">([^<]*)</a>', r'\1\2', s, count=1)" "--legal" "(c) host tel link removed (--legal)"
mut contact/index.html "s.replace('Missions en France et à l’international.','Missions en France et à l’international. 06 08 75 58 77',1)" "" "(d) national form in Contact"
mut index.html "s.replace(' \"email\": \"contact@sourcinno.com\",',' \"email\": \"contact@sourcinno.com\",\n \"telephone\": \"+33608755877\",',1)" "" "(e) JSON-LD telephone back"
mut tools/shell/footer.html "s.replace('mailto:contact@sourcinno.com','mailto:aymard.de.scorbiac@sourcinno.com',1)" "" "(f) old email as footer reference"
node tools/check.mjs --all >/dev/null 2>&1; echo "== restored: check.mjs --all exit=$?" >> "$LOG"
