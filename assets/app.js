const state = {
  search: "",
  category: "all",
  spirit: "all",
  selectedIngredients: new Set(),
  listScrollY: 0,
  activeDrinkId: null,
  previousScreen: "list"
};

const els = {
  appHeader: document.querySelector(".app-header"),
  listScreen: document.getElementById("listScreen"),
  builderScreen: document.getElementById("builderPage"),
  recipeScreen: document.getElementById("recipeScreen"),
  backToList: document.getElementById("backToList"),
  grid: document.getElementById("drinkGrid"),
  search: document.getElementById("searchInput"),
  category: document.getElementById("categoryFilter"),
  spirit: document.getElementById("spiritFilter"),
  count: document.getElementById("resultCount"),
  reset: document.getElementById("resetFilters"),
  prevDrink: document.getElementById("prevDrink"),
  nextDrink: document.getElementById("nextDrink"),
  detailContent: document.getElementById("detailContent"),
  cloud: document.getElementById("ingredientCloud"),
  builderOutput: document.getElementById("builderOutput"),
  themeToggle: document.getElementById("themeToggle"),
  bottomNav: document.querySelector(".bottom-nav")
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
    <article class="drink-card" role="button" tabindex="0" data-id="${escapeHTML(drink.id)}" aria-label="Open ${escapeHTML(drink.name)} recipe">
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
    </article>
  `).join("");

  requestAnimationFrame(() => els.grid.scrollTo({ left: 0, behavior: "instant" }));
}

function renderList(items, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${(items || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</${tag}>`;
}

function renderDetailContent(drink) {
  els.detailContent.innerHTML = `
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
      <section class="detail-box"><h4>Ingredients</h4>${renderList(drink.ingredients)}</section>
      <section class="detail-box"><h4>Step-by-Step Method</h4>${renderList(drink.instructions, true)}</section>
      <section class="detail-box"><h4>Creator / Origin</h4><p>${escapeHTML(drink.creator)}</p></section>
      <section class="detail-box"><h4>How It Became Popular</h4><p>${escapeHTML(drink.history)}</p></section>
      <section class="detail-box wide"><h4>Popular Variations</h4>${renderList(drink.variations)}</section>
    </div>
  `;
}

function instantTop() {
  try { window.scrollTo({ top: 0, behavior: "instant" }); }
  catch { window.scrollTo(0, 0); }
}

function setVisibleScreen(screen) {
  els.listScreen.classList.toggle("hidden", screen !== "list");
  els.builderScreen.classList.toggle("hidden", screen !== "builder");
  els.recipeScreen.classList.toggle("hidden", screen !== "recipe");
  document.body.classList.toggle("recipe-open", screen === "recipe");
  document.body.classList.toggle("builder-open", screen === "builder");
}

function setActiveNav(target) {
  document.querySelectorAll(".bottom-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.navTarget === target);
  });
}

function showList(push = true, target = "home") {
  setVisibleScreen("list");
  setActiveNav(target);
  if (push) history.pushState({ screen: "list", target }, "", target === "home" ? "#home" : target === "search" ? "#library" : target === "drinks" ? "#drinkGrid" : "#about");
}

function showBuilder(push = true) {
  state.previousScreen = "builder";
  setVisibleScreen("builder");
  setActiveNav("builder");
  if (push) history.pushState({ screen: "builder" }, "", "#builderPage");
  instantTop();
}

function showSearch() {
  showList(true, "search");
  requestAnimationFrame(() => {
    document.getElementById("library")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => els.search.focus({ preventScroll: true }), 250);
  });
}

function showDrinks() {
  showList(true, "drinks");
  requestAnimationFrame(() => document.getElementById("drinkGrid")?.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function showAbout() {
  showList(true, "about");
  requestAnimationFrame(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function openRecipe(id, preserveScroll = true, push = true) {
  const drink = COCKTAILS.find(item => item.id === id);
  if (!drink) return;
  if (preserveScroll) state.listScrollY = window.scrollY;
  state.activeDrinkId = id;
  renderDetailContent(drink);
  setVisibleScreen("recipe");
  if (push) history.pushState({ screen: "recipe", id, listScrollY: state.listScrollY, previousScreen: state.previousScreen }, "", `#drink-${id}`);
  instantTop();
}

function backFromRecipe(push = true) {
  if (state.previousScreen === "builder") {
    showBuilder(push);
    return;
  }
  showList(push, "drinks");
  requestAnimationFrame(() => {
    try { window.scrollTo({ top: state.listScrollY || 0, behavior: "instant" }); }
    catch { window.scrollTo(0, state.listScrollY || 0); }
  });
}

function buildIngredientCloud() {
  const ingredients = [...new Set(COCKTAILS.flatMap(drink =>
    (drink.ingredients || []).map(slugIngredient).filter(item => item.length > 2)
  ))].sort().slice(0, 90);
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
    .slice(0, 16);

  els.builderOutput.innerHTML = scored.length
    ? scored.map(({ drink, matches }) => `<button class="match-pill" type="button" data-id="${escapeHTML(drink.id)}"><strong>${escapeHTML(drink.name)}</strong><span>${matches.length} match${matches.length === 1 ? "" : "es"}: ${escapeHTML(matches.map(titleCase).join(", "))}</span></button>`).join("")
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
  showSearch();
}

function scrollCarousel(direction) {
  const card = els.grid.querySelector(".drink-card");
  const amount = card ? card.getBoundingClientRect().width + 16 : Math.round(window.innerWidth * 0.84);
  els.grid.scrollBy({ left: direction * amount, behavior: "smooth" });
}

function bindEvents() {
  els.search.addEventListener("input", e => { state.search = e.target.value; renderCards(); });
  els.category.addEventListener("change", e => { state.category = e.target.value; renderCards(); });
  els.spirit.addEventListener("change", e => { state.spirit = e.target.value; renderCards(); });
  els.reset.addEventListener("click", resetFilters);
  els.prevDrink.addEventListener("click", () => scrollCarousel(-1));
  els.nextDrink.addEventListener("click", () => scrollCarousel(1));

  els.grid.addEventListener("click", e => {
    const card = e.target.closest(".drink-card[data-id]");
    if (card) {
      state.previousScreen = "list";
      openRecipe(card.dataset.id);
    }
  });

  els.grid.addEventListener("keydown", e => {
    const card = e.target.closest(".drink-card[data-id]");
    if ((e.key === "Enter" || e.key === " ") && card) {
      e.preventDefault();
      state.previousScreen = "list";
      openRecipe(card.dataset.id);
    }
  });

  els.backToList.addEventListener("click", () => backFromRecipe(true));

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
    if (match) {
      state.previousScreen = "builder";
      openRecipe(match.dataset.id);
    }
  });

  document.querySelectorAll("[data-jump]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      link.dataset.jump === "builder" ? showBuilder(true) : showSearch();
    });
  });

  els.bottomNav.addEventListener("click", e => {
    const link = e.target.closest(".bottom-nav-item");
    if (!link) return;
    e.preventDefault();
    const target = link.dataset.navTarget;
    if (target === "home") { showList(true, "home"); instantTop(); }
    if (target === "search") showSearch();
    if (target === "drinks") showDrinks();
    if (target === "builder") showBuilder(true);
    if (target === "about") showAbout();
  });

  window.addEventListener("popstate", e => {
    const screen = e.state?.screen;
    if (screen === "recipe" && e.state.id) {
      state.previousScreen = e.state.previousScreen || "list";
      state.listScrollY = e.state.listScrollY || state.listScrollY;
      openRecipe(e.state.id, false, false);
    } else if (screen === "builder") {
      showBuilder(false);
    } else {
      showList(false, e.state?.target || "home");
    }
  });

  els.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("sheltonPourTheme", next);
    els.themeToggle.textContent = next === "light" ? "☀" : "☾";
  });
}

function initTheme() {
  const saved = localStorage.getItem("sheltonPourTheme") || "light";
  document.documentElement.dataset.theme = saved;
  els.themeToggle.textContent = saved === "light" ? "☀" : "☾";
}

function initRouteFromHash() {
  const hash = window.location.hash;
  const drinkMatch = hash.match(/^#drink-(.+)$/);
  if (drinkMatch) {
    const id = decodeURIComponent(drinkMatch[1]);
    state.listScrollY = Number(sessionStorage.getItem("sheltonPourListScroll") || 0);
    const drink = COCKTAILS.find(item => item.id === id);
    if (drink) {
      renderDetailContent(drink);
      setVisibleScreen("recipe");
      history.replaceState({ screen: "recipe", id, listScrollY: state.listScrollY, previousScreen: "list" }, "", `#drink-${id}`);
      instantTop();
      return;
    }
  }
  if (hash === "#builderPage") {
    showBuilder(false);
    history.replaceState({ screen: "builder" }, "", "#builderPage");
    return;
  }
  showList(false, hash === "#library" ? "search" : hash === "#drinkGrid" ? "drinks" : hash === "#about" ? "about" : "home");
  history.replaceState({ screen: "list" }, "", hash || "#home");
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
  initRouteFromHash();
  window.addEventListener("beforeunload", () => sessionStorage.setItem("sheltonPourListScroll", String(window.scrollY)));
}

initApp();
