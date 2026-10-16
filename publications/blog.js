/* gtm-blog: written by sync from blog/profile.json (site.lang, tags); an edit here is overwritten. */
(function client(T, ORDER) {
  const list = document.getElementById("blog-list");
  const cards = list ? [...list.querySelectorAll("details[data-tag]")] : [];
  if (!cards.length) return;
  const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const texts = new Map(cards.map((c) => [c, fold(c.textContent)]));
  const present = new Set(cards.map((c) => c.dataset.tag));
  const tags = [...ORDER.filter((t) => present.has(t)), ...[...present].filter((t) => !ORDER.includes(t))];
  const make = (tag, props, attrs = {}) => {
    const e = Object.assign(document.createElement(tag), props);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  const tools = make("div", { className: "blog-tools" });
  const search = make("input", { type: "search", className: "blog-search", placeholder: T.search }, { "aria-label": T.search });
  const chips = make("div", { className: "blog-chips" }, { role: "group", "aria-label": T.filter });
  const count = make("p", { className: "blog-count" }, { "aria-live": "polite" });
  let pressed = "";
  const show = () => {
    const words = fold(search.value).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const c of cards) {
      c.hidden = !((!pressed || c.dataset.tag === pressed) && words.every((w) => texts.get(c).includes(w)));
      if (!c.hidden) n++;
    }
    for (const b of chips.children) b.setAttribute("aria-pressed", String(b.dataset.tag === pressed));
    count.textContent = T.shown.replace("{n}", String(n));
  };
  for (const [label, tag] of [[T.all, ""], ...tags.map((t) => [t, t])]) {
    const b = make("button", { type: "button", className: "chip", textContent: label });
    b.dataset.tag = tag;
    b.addEventListener("click", () => { pressed = tag; show(); });
    chips.append(b);
  }
  const reveal = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    if (card.hidden) { search.value = ""; pressed = ""; show(); }
    card.open = true;
    card.scrollIntoView({ block: "start" });
  };
  for (const c of cards) c.addEventListener("toggle", () => {
    if (!c.open) return;
    const top = c.getBoundingClientRect().top;
    for (const o of cards) if (o !== c && o.open) o.open = false;
    const moved = c.getBoundingClientRect().top - top;
    if (moved) scrollBy(0, moved);
  });
  search.addEventListener("input", show);
  tools.append(search, chips, count);
  list.before(tools);
  show();
  reveal();
  addEventListener("hashchange", reveal);
})({"search":"Rechercher dans les articles","all":"Tous","filter":"Filtrer par étiquette","shown":"{n} article(s) affiché(s)"}, ["IA","Venture Building","Startup"]);
