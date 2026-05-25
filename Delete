const state = {
  search: "",
  category: "all",
  spirit: "all",
  selectedIngredients: new Set()
};

const els = {
  grid: document.getElementById("drinkGrid"),
  search: document.getElementById("searchInput"),
  category: document.getElementById("categoryFilter"),
  spirit: document.getElementById("spiritFilter"),
  count: document.getElementById("resultCount"),
  reset: document.getElementById("resetFilters"),
  detail: document.getElementById("detailPanel"),
  detailContent: document.getElementById("detailContent"),
  closeDetail: document.getElementById("closeDetail"),
  cloud: document.getElementById("ingredientCloud"),
  builderOutput: document.getElementById("builderOutput"),
  themeToggle: document.getElementById("themeToggle")
};

const PLACEHOLDER_IMAGE = "assets/images/placeholder.svg";

function drinkImageSrc(drink) {
  return drink.image || `assets/images/${drink.id}.jpg`;
}

function imageFallbackAttr() {
  return `onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';this.classList.add('image-placeholder-active');"`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
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

function uniqueValues(key) {
  return [...new Set(COCKTAILS.map(drink => drink[key]).filter(Boolean))].sort();
}

function populateFilters() {
  uniqueValues("category").forEach(value => els.category.append(new Option(value, value)));
  uniqueValues("baseSpirit").forEach(value => els.spirit.append(new Option(value, value)));
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

function filteredDrinks() {
  const q = state.search.trim().toLowerCase();
  return COCKTAILS.filter(drink => {
    const matchesSearch = !q || searchableText(drink).includes(q);
    const matchesCategory = state.category === "all" || drink.category === state.category;
    const matchesSpirit = state.spirit === "all" || drink.baseSpirit === state.spirit;
    return matchesSearch && matchesCategory && matchesSpirit;
  });
}

function renderCards() {
  const drinks = filteredDrinks();
  els.count.textContent = `${drinks.length} cocktail${drinks.length === 1 ? "" : "s"} found`;

  if (!drinks.length) {
    els.grid.innerHTML = `<article class="drink-card empty-card"><h3>No drinks found</h3><p>Try clearing filters or searching by base spirit, ingredient, glassware, or style.</p></article>`;
    return;
  }

  els.grid.innerHTML = drinks.map(drink => `
    <article class="drink-card" role="button" tabindex="0" data-id="${escapeHTML(drink.id)}" aria-label="Open ${escapeHTML(drink.name)}">
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
    </article>
  `).join("");
}

function renderList(items, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${(items || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</${tag}>`;
}

function renderDetail(id) {
  const drink = COCKTAILS.find(item => item.id === id);
  if (!drink) return;

  els.detailContent.innerHTML = `
    <div class="detail-hero">
      <div>
        <p class="section-label">${escapeHTML(drink.category)} · ${escapeHTML(drink.baseSpirit)} · ${escapeHTML(drink.strength)}</p>
        <h2 class="detail-title">${escapeHTML(drink.name)}</h2>
        <p class="hero-text"><strong>Glassware:</strong> ${escapeHTML(drink.glassware)}<br><strong>Garnish:</strong> ${escapeHTML(drink.garnish)}</p>
      </div>
      <div class="detail-image-wrap">
        <img class="detail-image" src="${escapeHTML(drinkImageSrc(drink))}" alt="${escapeHTML(drink.name)} cocktail photo" ${imageFallbackAttr()} />
      </div>
    </div>
    <div class="detail-grid">
      <section class="detail-box"><h4>Ingredients</h4>${renderList(drink.ingredients)}</section>
      <section class="detail-box"><h4>Step-by-Step Method</h4>${renderList(drink.instructions, true)}</section>
      <section class="detail-box"><h4>Creator / Origin</h4><p>${escapeHTML(drink.creator)}</p></section>
      <section class="detail-box"><h4>How It Became Popular</h4><p>${escapeHTML(drink.history)}</p></section>
      <section class="detail-box"><h4>Popular Variations</h4>${renderList(drink.variations)}</section>
      <section class="detail-box"><h4>Tags</h4><div class="tag-row">${(drink.tags || []).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}</div></section>
    </div>
  `;
  els.detail.classList.remove("hidden");
  els.detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildIngredientCloud() {
  const ingredients = [...new Set(COCKTAILS.flatMap(drink =>
    (drink.ingredients || []).map(slugIngredient).filter(item => item.length > 2)
  ))].sort().slice(0, 70);

  els.cloud.innerHTML = ingredients.map(item => `<button class="ingredient-button" type="button" data-ingredient="${escapeHTML(item)}">${escapeHTML(titleCase(item))}</button>`).join("");
}

function renderBuilderMatches() {
  const selected = [...state.selectedIngredients];
  if (!selected.length) {
    els.builderOutput.textContent = "Select ingredients to begin.";
    return;
  }

  const scored = COCKTAILS.map(drink => {
    const drinkText = (drink.ingredients || []).map(slugIngredient).join(" ");
    const matches = selected.filter(item => drinkText.includes(item));
    return { drink, matches, score: matches.length };
  })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.drink.name.localeCompare(b.drink.name))
    .slice(0, 12);

  els.builderOutput.innerHTML = scored.length
    ? scored.map(({ drink, matches }) => `<button class="match-pill" type="button" data-id="${escapeHTML(drink.id)}"><strong>${escapeHTML(drink.name)}</strong> — ${matches.length} match${matches.length === 1 ? "" : "es"}: ${escapeHTML(matches.map(titleCase).join(", "))}</button>`).join(" ")
    : "No matches yet. Try selecting a base spirit, citrus, sweetener, or soda.";
}

function resetFilters() {
  state.search = "";
  state.category = "all";
  state.spirit = "all";
  els.search.value = "";
  els.category.value = "all";
  els.spirit.value = "all";
  renderCards();
}

function bindEvents() {
  els.search.addEventListener("input", e => { state.search = e.target.value; renderCards(); });
  els.category.addEventListener("change", e => { state.category = e.target.value; renderCards(); });
  els.spirit.addEventListener("change", e => { state.spirit = e.target.value; renderCards(); });
  els.reset.addEventListener("click", resetFilters);

  els.grid.addEventListener("click", e => {
    const card = e.target.closest(".drink-card[data-id]");
    if (card) renderDetail(card.dataset.id);
  });

  els.grid.addEventListener("keydown", e => {
    const card = e.target.closest(".drink-card[data-id]");
    if ((e.key === "Enter" || e.key === " ") && card) {
      e.preventDefault();
      renderDetail(card.dataset.id);
    }
  });

  els.closeDetail.addEventListener("click", () => els.detail.classList.add("hidden"));

  els.cloud.addEventListener("click", e => {
    const btn = e.target.closest(".ingredient-button");
    if (!btn) return;
    const value = btn.dataset.ingredient;
    btn.classList.toggle("active");
    state.selectedIngredients.has(value) ? state.selectedIngredients.delete(value) : state.selectedIngredients.add(value);
    renderBuilderMatches();
  });

  els.builderOutput.addEventListener("click", e => {
    const match = e.target.closest(".match-pill[data-id]");
    if (match) renderDetail(match.dataset.id);
  });

  els.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("sheltonPourTheme", next);
    els.themeToggle.textContent = next === "light" ? "☀" : "☾";
  });
}

function initTheme() {
  const saved = localStorage.getItem("sheltonPourTheme") || "dark";
  document.documentElement.dataset.theme = saved;
  els.themeToggle.textContent = saved === "light" ? "☀" : "☾";
}

function initApp() {
  if (!Array.isArray(window.COCKTAILS || COCKTAILS)) {
    els.count.textContent = "Cocktail data failed to load.";
    return;
  }
  initTheme();
  populateFilters();
  buildIngredientCloud();
  bindEvents();
  renderCards();
}

initApp();
