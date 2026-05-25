const PLACEHOLDER_IMAGE = "assets/images/placeholder.svg";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}

function drinkImageSrc(drink) {
  return drink.image || `assets/images/${drink.id}.jpg`;
}

function imageFallbackAttr() {
  return `onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';this.classList.add('image-placeholder-active');"`;
}

function renderBottomNav(active) {
  const nav = document.getElementById("bottomNav");
  if (!nav) return;
  const items = [
    ["index.html", "⌂", "Home", "home"],
    ["search.html", "⌕", "Search", "search"],
    ["drinks.html", "▦", "Drinks", "drinks"],
    ["builder.html", "✦", "Builder", "builder"],
    ["about.html", "ⓘ", "About", "about"]
  ];
  nav.innerHTML = items.map(([href, icon, label, key]) => `
    <a href="${href}" class="bottom-nav-item ${active === key ? "active" : ""}">
      <span class="nav-icon">${icon}</span><span>${label}</span>
    </a>
  `).join("");
}

function initTheme() {
  const btn = document.getElementById("themeToggle");
  const saved = localStorage.getItem("sheltonPourTheme") || "light";
  document.documentElement.dataset.theme = saved;
  if (btn) btn.textContent = saved === "light" ? "☀" : "☾";
  btn?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("sheltonPourTheme", next);
    btn.textContent = next === "light" ? "☀" : "☾";
  });
}

function pageShell(active) {
  renderBottomNav(active);
  initTheme();
}

function uniqueValues(key) {
  return [...new Set(COCKTAILS.map(drink => drink[key]).filter(Boolean))].sort();
}

function searchableText(drink) {
  return [
    drink.name,
    drink.category,
    drink.baseSpirit,
    drink.strength,
    drink.glassware,
    drink.garnish,
    drink.creator,
    drink.history,
    ...(drink.ingredients || []),
    ...(drink.instructions || []),
    ...(drink.variations || []),
    ...(drink.tags || [])
  ].join(" ").toLowerCase();
}

function recipeUrl(id) {
  return `recipe.html?id=${encodeURIComponent(id)}`;
}

function cardMarkup(drink) {
  return `
    <a class="drink-card" href="${recipeUrl(drink.id)}" aria-label="Open ${escapeHTML(drink.name)} recipe">
      <div class="drink-image-wrap">
        <img class="drink-image" src="${escapeHTML(drinkImageSrc(drink))}" alt="${escapeHTML(drink.name)} cocktail photo" loading="lazy" ${imageFallbackAttr()} />
      </div>
      <div class="card-top">
        <span class="card-label">${escapeHTML(drink.category)}</span>
        <span class="abv-note">${escapeHTML(drink.strength)}</span>
      </div>
      <h3>${escapeHTML(drink.name)}</h3>
      <p><strong>${escapeHTML(drink.baseSpirit)}</strong> · ${escapeHTML(drink.glassware)} · ${escapeHTML(drink.garnish)}</p>
      <div class="tag-row">${(drink.tags || []).slice(0, 4).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
      <span class="open-recipe">Open recipe →</span>
    </a>
  `;
}

function renderDrinkCarousel(targetId, drinks = COCKTAILS) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = drinks.length
    ? drinks.map(cardMarkup).join("")
    : `<article class="drink-card empty-card"><h3>No drinks found</h3><p>Try clearing filters or searching by base spirit, ingredient, glassware, or style.</p></article>`;
}

function scrollCarousel(targetId, direction) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const card = target.querySelector(".drink-card");
  const amount = card ? card.getBoundingClientRect().width + 16 : Math.round(window.innerWidth * 0.84);
  target.scrollBy({ left: direction * amount, behavior: "smooth" });
}

function initSearchPage() {
  pageShell("search");
  const input = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const spirit = document.getElementById("spiritFilter");
  const count = document.getElementById("resultCount");

  uniqueValues("category").forEach(value => category.append(new Option(value, value)));
  uniqueValues("baseSpirit").forEach(value => spirit.append(new Option(value, value)));

  function filter() {
    const q = input.value.trim().toLowerCase();
    const categoryValue = category.value;
    const spiritValue = spirit.value;
    const results = COCKTAILS.filter(drink => {
      const matchesSearch = !q || searchableText(drink).includes(q);
      const matchesCategory = categoryValue === "all" || drink.category === categoryValue;
      const matchesSpirit = spiritValue === "all" || drink.baseSpirit === spiritValue;
      return matchesSearch && matchesCategory && matchesSpirit;
    });
    count.textContent = `${results.length} cocktail${results.length === 1 ? "" : "s"} found`;
    renderDrinkCarousel("searchResults", results);
  }

  input.addEventListener("input", filter);
  category.addEventListener("change", filter);
  spirit.addEventListener("change", filter);
  document.getElementById("resetFilters")?.addEventListener("click", () => {
    input.value = "";
    category.value = "all";
    spirit.value = "all";
    filter();
    input.focus();
  });
  document.getElementById("prevDrink")?.addEventListener("click", () => scrollCarousel("searchResults", -1));
  document.getElementById("nextDrink")?.addEventListener("click", () => scrollCarousel("searchResults", 1));
  filter();
  setTimeout(() => input.focus(), 150);
}

function initDrinksPage() {
  pageShell("drinks");
  renderDrinkCarousel("drinkCarousel", COCKTAILS);
  document.getElementById("prevDrink")?.addEventListener("click", () => scrollCarousel("drinkCarousel", -1));
  document.getElementById("nextDrink")?.addEventListener("click", () => scrollCarousel("drinkCarousel", 1));
}

function slugIngredient(text = "") {
  return text
    .toLowerCase()
    .replace(/\b\d+(\.\d+)?\b/g, "")
    .replace(/\b(oz|dash|dashes|barspoon|cup|cups|tsp|tbsp|ml|optional|fresh|large|small|pinch|for rim|to top|chilled)\b/g, "")
    .replace(/[;,.()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

function initBuilderPage() {
  pageShell("builder");
  const cloud = document.getElementById("ingredientCloud");
  const output = document.getElementById("builderOutput");
  const selected = new Set();
  const ingredients = [...new Set(COCKTAILS.flatMap(drink =>
    (drink.ingredients || []).map(slugIngredient).filter(item => item.length > 2)
  ))].sort().slice(0, 120);

  cloud.innerHTML = ingredients.map(item => `<button class="ingredient-button" type="button" data-ingredient="${escapeHTML(item)}">${escapeHTML(titleCase(item))}</button>`).join("");

  function renderMatches() {
    const picks = [...selected];
    if (!picks.length) {
      output.innerHTML = "Select ingredients to begin.";
      return;
    }

    const scored = COCKTAILS.map(drink => {
      const drinkText = (drink.ingredients || []).map(slugIngredient).join(" ");
      const matches = picks.filter(item => drinkText.includes(item));
      return { drink, matches, score: matches.length };
    })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.drink.name.localeCompare(b.drink.name))
      .slice(0, 18);

    output.innerHTML = scored.length
      ? scored.map(({ drink, matches }) => `
        <a class="match-pill" href="${recipeUrl(drink.id)}">
          <strong>${escapeHTML(drink.name)}</strong>
          <span>${matches.length} match${matches.length === 1 ? "" : "es"}: ${escapeHTML(matches.map(titleCase).join(", "))}</span>
        </a>
      `).join("")
      : "No matches yet. Try selecting a base spirit, citrus, sweetener, or soda.";
  }

  cloud.addEventListener("click", e => {
    const btn = e.target.closest(".ingredient-button");
    if (!btn) return;
    const value = btn.dataset.ingredient;
    btn.classList.toggle("active");
    selected.has(value) ? selected.delete(value) : selected.add(value);
    renderMatches();
  });
}

function initRecipePage() {
  pageShell("drinks");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const drink = COCKTAILS.find(item => item.id === id) || COCKTAILS[0];
  const target = document.getElementById("recipeContent");
  if (!target || !drink) return;

  const list = (items = [], ordered = false) => {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</${tag}>`;
  };

  target.innerHTML = `
    <div class="detail-hero">
      <div>
        <p class="section-label">${escapeHTML(drink.category)} · ${escapeHTML(drink.baseSpirit)} · ${escapeHTML(drink.strength)}</p>
        <h2 class="detail-title">${escapeHTML(drink.name)}</h2>
        <p class="hero-text"><strong>Glassware:</strong> ${escapeHTML(drink.glassware)}<br><strong>Garnish:</strong> ${escapeHTML(drink.garnish)}</p>
        <div class="tag-row detail-tags">${(drink.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div>
      </div>
      <div class="detail-image-wrap">
        <img class="detail-image" src="${escapeHTML(drinkImageSrc(drink))}" alt="${escapeHTML(drink.name)} cocktail photo" ${imageFallbackAttr()} />
      </div>
    </div>
    <div class="detail-grid">
      <section class="detail-box"><h4>Ingredients</h4>${list(drink.ingredients)}</section>
      <section class="detail-box"><h4>Step-by-Step Method</h4>${list(drink.instructions, true)}</section>
      <section class="detail-box"><h4>Creator / Origin</h4><p>${escapeHTML(drink.creator)}</p></section>
      <section class="detail-box"><h4>How It Became Popular</h4><p>${escapeHTML(drink.history)}</p></section>
      <section class="detail-box wide"><h4>Popular Variations</h4>${list(drink.variations)}</section>
    </div>
  `;
}
