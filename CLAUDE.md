# CLAUDE.md — Animation Nation

## Project Overview

Animation Nation is a community-driven CSS animation gallery created by the Zero to Mastery (ZTM) community for Hacktoberfest 2019. It is a static website that showcases pure HTML + CSS animations submitted by contributors. The event has concluded, but the project continues to accept contributions.

**Core constraint:** Submissions must use only HTML `<div>` elements and CSS. No JavaScript, no SVG elements are permitted in art submissions.

---

## Repository Structure

```
Animation-Nation/
├── index.html          # Main gallery page (static shell, content injected by include.js)
├── style.css           # Gallery-level styles (flex layout, card hover swing animation)
├── include.js          # Card data array + DOM generation script (~2400 lines)
├── colourpencils.png   # Banner image used in README
├── README.md           # Contribution guide and project rules
└── Art/                # All contributor submissions (~357 subdirectories)
    └── <ArtistName>/
        ├── index.html  # The animation page
        ├── style.css   # Animation styles
        └── *.gif|*.png # Preview thumbnail (preferably square/squarish)
```

---

## Key Files

### `include.js`
The central registry and gallery engine. Contains a `cards` array where each entry describes one submission:

```javascript
let cards = [
  {
    artName: 'That Animation',
    pageLink: './Art/MaKloudz/index.html',
    imageLink: './Art/MaKloudz/dat-animation.gif',
    author: 'Blessing Mutava',
    githubLink: 'https://github.com/MaKloudz',
  },
  // ...
];
```

After the array, the script dynamically generates `<li>` card elements and injects them into `#cards` in `index.html`. **Every new submission requires a corresponding entry appended to this array.**

### `index.html`
Minimal shell page. Loads Font Awesome (v5.3.1) and Normalize.css via CDN, links `style.css`, renders a header/footer, and includes `include.js` at the bottom of `<body>`.

### `style.css`
Gallery-level styling only. Defines:
- Flex-based card grid layout
- `swing` keyframe animation triggered on card hover (uses `-webkit-` prefixes for compatibility)
- Header/footer styles

This file is **not** where submission animations live — each submission has its own `style.css`.

---

## Contribution Workflow

1. Fork the repository and clone locally.
2. Create a folder inside `Art/` named after yourself (e.g., `Art/YourName/`).
3. Add at minimum:
   - `index.html` — Animation page (HTML `<div>`s only, no `<script>`, no SVG)
   - `style.css` — All animation styles linked from the HTML file
   - A preview image (`.gif` strongly preferred; static `.png` acceptable)
4. Append a new object to the `cards` array in `include.js`:
   ```javascript
   {
     artName: 'Your Art Title',
     pageLink: './Art/YourName/index.html',
     imageLink: './Art/YourName/preview.gif',
     author: 'Your Full Name',
     githubLink: 'https://github.com/YourUsername',
   },
   ```
5. Open `index.html` in a browser to verify your card renders correctly.
6. Submit a pull request to the `master` branch.

---

## Code Conventions

### HTML (submissions)
- Standard HTML5 boilerplate with `charset="UTF-8"` and viewport meta tag.
- Only `<div>` elements for the animation — no `<script>` tags, no SVG.
- Link the external CSS file with `<link rel="stylesheet" href="style.css">` (or the actual filename).
- Keep markup minimal; all visual complexity lives in CSS.

### CSS (submissions)
- Self-contained: all styles in the submission's own `style.css`.
- Use `@keyframes` for animations; name keyframes descriptively (e.g., `spin`, `blink`, `pulse`).
- Include `-webkit-` vendor prefixes alongside standard properties for broad browser support.
- Responsive units (`vh`, `vw`, `em`, `%`) preferred over fixed `px` where it improves display.
- Common patterns seen across submissions:
  - `transform: rotate() / scale() / translateX() / translateY()`
  - `animation: <name> <duration> <timing-function> <iteration-count>`
  - `transition: all <duration> <easing>` for interactive effects
  - `border` and `box-shadow` manipulated inside keyframes for creative effects

### JavaScript (`include.js` only)
- camelCase property names: `artName`, `pageLink`, `imageLink`, `author`, `githubLink`.
- New entries are appended at the **end** of the `cards` array (before the closing `]`).
- Do not modify the DOM generation logic below the array unless fixing a bug.

### File naming
- Art folder names: typically match the contributor's GitHub username or a short descriptive name.
- HTML entry point: `index.html` (preferred) or a descriptively named `.html` file.
- CSS entry point: `style.css` (preferred) or a descriptively named `.css` file.
- Preview image: `.gif` preferred; descriptive name reflecting the animation.

---

## Rules & Constraints (Enforced by Review)

| Allowed | Not Allowed |
|---------|-------------|
| HTML `<div>` elements | `<script>` tags or `.js` files |
| CSS animations & transitions | SVG elements |
| External CSS via `<link>` | Inline JavaScript (`onclick`, etc.) |
| `.gif` / `.png` preview images | Copying code from others |
| Original artwork | Third-party animation libraries |

---

## No Build Process

This is a zero-dependency static project:
- No `package.json`, no npm, no bundler.
- No CI/CD pipeline.
- No test framework.
- To preview locally, open `index.html` directly in a browser — no server needed.

---

## External Dependencies (CDN only, gallery-level)

- **Font Awesome v5.3.1** — Icon library (used in gallery shell)
- **Normalize.css v8.0.0** — CSS reset (used in gallery shell)

Submissions should not depend on external CDNs unless there is a compelling reason.

---

## AI Assistant Guidelines

When helping with this project:

1. **Never add JavaScript to art submissions.** The hard rule is HTML + CSS only. If a requested effect requires JS, suggest a pure CSS alternative.
2. **Never add SVG to art submissions.** Use CSS-only shapes (borders, transforms, clip-path, border-radius).
3. **When adding a new submission**, always update `include.js` in addition to creating the `Art/<name>/` folder.
4. **Preserve the `cards` array format** in `include.js` — trailing commas after each object are the existing style; match it.
5. **Do not modify `style.css` (root) or `index.html`** unless fixing a gallery-level bug — submissions are isolated in their own folders.
6. **Preview images must be created by the contributor** — do not generate or reference placeholder images.
7. **Keep submissions self-contained** — all paths inside a submission's HTML/CSS must be relative to that submission's folder.
8. **Vendor prefix both `-webkit-` and standard** CSS properties for animations, as the existing codebase does.
