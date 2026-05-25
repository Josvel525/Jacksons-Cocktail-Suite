# Shelton Pour — Cocktail Recipe Web App

A static, GitHub-ready bartending web app starter created for Jackson Shelton.

## What it does

- Search cocktails by name, ingredient, spirit, glassware, garnish, creator, history, or tag.
- Filter by category and base spirit.
- Open detailed drink cards with:
  - Ingredients
  - Step-by-step method
  - Glassware
  - Garnish
  - Creator/origin notes
  - Historical background
  - Popular variations
- Use a simple “Bar Builder” to match drinks based on ingredients on hand.
- Toggle light/dark mode with localStorage.
- Works as a static site on GitHub Pages, Netlify, Vercel, or any basic web host.

## File structure

```text
jackson-bartending-app/
├── index.html
├── README.md
├── data/
│   └── cocktails.js
└── assets/
    ├── app.js
    └── styles.css
```

## How to run locally

Open `index.html` in a browser.

For a local server:

```bash
python3 -m http.server 8080
```

Then visit:

```text
http://localhost:8080
```

## How to add more drinks

Open `data/cocktails.js` and copy an existing cocktail object.

Required fields:

```js
{
  id: "unique-drink-id",
  name: "Drink Name",
  category: "Classic",
  baseSpirit: "Gin",
  strength: "Medium",
  glassware: "Coupe",
  garnish: "Lemon twist",
  ingredients: ["2 oz spirit", "1 oz citrus"],
  instructions: ["Shake with ice.", "Strain into glass."],
  creator: "Known creator or disputed origin note.",
  history: "How the drink evolved and became popular.",
  variations: ["Variation 1", "Variation 2"],
  tags: ["shaken", "citrus", "classic"]
}
```

## Important note about “every single drink possible”

No single app can honestly ship with every cocktail ever created without a large licensed/public-domain data strategy. This starter is built with a scalable structure so Jackson can expand the library over time.

Good next upgrades:

1. Add 100–500 public-domain classic recipes.
2. Add user accounts and favorites.
3. Add “I have these ingredients” exact-match logic.
4. Add batch import from CSV or JSON.
5. Add source citations for cocktail history entries.
6. Add admin editor for adding drinks without touching code.


## Current Expansion

This version adds 10 extra cocktail records to the original library: Whiskey Sour, Cosmopolitan, Paloma, Moscow Mule, Sidecar, French 75, Aperol Spritz, Tom Collins, Piña Colada, and Bloody Mary.

JavaScript improvements included:

- safer HTML rendering with escaping
- better empty-state messaging
- improved ingredient matching for the Bar Builder
- clickable Bar Builder match results
- stable sorting for builder recommendations
- expanded ingredient cloud capacity

## Cocktail images

The app now supports cocktail images with a safe placeholder fallback.

To add real images later, place `.jpg` files in:

```txt
assets/images/
```

Name each file to match the cocktail `id` in `data/cocktails.js`:

```txt
old-fashioned.jpg
margarita.jpg
espresso-martini.jpg
```

No JavaScript change is required when using this naming pattern. If you prefer custom file names or PNG/WebP files, add an `image` field to any cocktail object:

```js
image: "assets/images/my-custom-photo.webp"
```
