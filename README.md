<p align="center">
  <img src="https://raw.githubusercontent.com/littlenines/quill-image-alt/master/images/altlogo.png" alt="" width="180" />
</p>
<h1 align="center">quill-image-alt</h1>
<p align="center">
  <img src="https://img.shields.io/npm/v/quill-image-alt" alt="version" />
  <img src="https://img.shields.io/bundlephobia/minzip/quill-image-alt?style=flat" alt="size" />
  <img src="https://img.shields.io/npm/l/quill-image-alt?style=flat" alt="license" />
  <img src="https://img.shields.io/npm/dt/quill-image-alt?style=flat&color=blue&cacheSeconds=3600" alt="downloads" />
  <img src="https://img.shields.io/badge/Quill_compatible-2.0.3-blue?style=flat&cacheSeconds=3600" alt="Quill compatible 2.0.3" />
  <a href="https://quill-image-alt.vercel.app/">
    <img src="https://img.shields.io/badge/Live-Demo-00c7b7?logo=vercel&logoColor=white&style=flat-square" alt="Live Demo" />
  </a>
</p>

A lightweight [Quill](https://quilljs.com/) module for adding and editing image `alt` text directly inside the editor.

Hovering/Selecting an image shows a small badge anchored to it. The badge is orange when the image has no `alt` text yet, so missing alt text is visible at a glance. Clicking it opens a small inline input to set or edit the description.

Pairs well with [`resize-quill-image`](https://www.npmjs.com/package/resize-quill-image) — both modules can be registered on the same Quill instance and coexist correctly on the same image, including while it's selected for resizing.

---
- [Demo](#demo)
- [Installation](#installation)
  - [npm](#npm)
  - [CDN](#cdn)
- [Usage](#usage)
  - [Import the module](#1-import-the-module)
  - [Register the module with Quill](#2-register-the-module-with-quill)
  - [Configure the Quill editor](#3-configure-the-quill-editor)
- [How it works](#how-it-works)
- [Options](#options)
  - [Option Descriptions](#option-descriptions)
  - [Badge Positions](#badge-positions)
  - [Style Options](#style-options)
- [TypeScript](#typescript)
- [Cleanup / Destroy](#cleanup--destroy)
  - [Usage](#usage-1)
  - [When to use](#when-to-use)
  - [Example with unmount](#example-with-unmount)
- [Problems](#problems)
- [License](#license)

---

## [Demo](#demo)

### Live
[Check out the live demo](https://quill-image-alt.vercel.app/)

![Badge and popover open on an image, prompting for alt text](https://raw.githubusercontent.com/littlenines/quill-image-alt/master/images/example.png)

## [Installation](#installation)

### [npm](#npm)

```bash
npm install quill-image-alt
```

> **Compatible with [`react-quill-new`](https://www.npmjs.com/package/react-quill-new)** — works out of the box since `react-quill-new` uses Quill 2.x under the hood.

### [CDN](#cdn)

Load Quill first, then the module. The module exposes a global `QuillImageAlt` variable.

**unpkg:**
```html
<link href="https://unpkg.com/quill@2.0.3/dist/quill.snow.css" rel="stylesheet">
<script src="https://unpkg.com/quill@2.0.3/dist/quill.js"></script>
<script src="https://unpkg.com/quill-image-alt/dist/index.iife.js"></script>
```

**jsDelivr:**
```html
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>
<script src="https://cdn.jsdelivr.net/npm/quill-image-alt/dist/index.iife.js"></script>
```

Then register and use it:
```html
<script>
  Quill.register('modules/altText', QuillImageAlt);

  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [['image']],
      altText: {}
    }
  });
</script>
```

> **Note:** Quill must be loaded before `quill-image-alt`.

---

## [Usage](#usage)

### 1. Import the module

```js
import AltText from 'quill-image-alt';
```

### 2. Register the module with Quill

```js
Quill.register('modules/altText', AltText);
```

### 3. Configure the Quill editor

```js
const quill = new Quill(editorContainer, {
  modules: {
    toolbar: toolbarOptions,
    altText: true
  },
  placeholder: 'Compose an epic...',
  theme: 'snow'
});
```

---

## [How it works](#how-it-works)

- **Hover an image** → a small badge appears at its edge (`top-center` by default). Orange means the image has no `alt` text, the neutral color means it does.
- **Click the badge** → an inline input opens, pre-filled with the current `alt` text.
- **Enter** saves, **Escape** discards the edit and closes the input without changing anything.
- **Selecting an image** also pins the badge visible, even without hovering.

---

## [Options](#options)

You can configure the behavior of `quill-image-alt` by passing options inside your Quill config:

```js
altText: {
  badgeText: 'ALT',
  position: 'top-center',
  placeholder: 'Describe this image…'
}
```

### [Option Descriptions](#option-descriptions)

| Option         | Type     | Default                    | Description |
|----------------|----------|-----------------------------|-------------|
| `badgeText`    | `string` | `'ALT'`                    | Text shown on the badge. |
| `placeholder`  | `string` | `'Describe this image…'`   | Placeholder text in the alt-text input. |
| `position`     | `string` | `'top-center'`              | Where the badge is anchored on the image. See [Badge Positions](#badge-positions). |
| `badgeColor`   | `string` | `'#333'`                   | Badge background when the image already has alt text. |
| `missingColor` | `string` | `'#d9822b'`                 | Badge background when alt text is missing. |
| `textColor`    | `string` | `'#fff'`                   | Badge text color, used in both states. |

### [Badge Positions](#badge-positions)

`position` accepts one of:

`top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

Each anchors the badge to that corner/edge of the image, straddling its border.

### [Style Options](#style-options)

For anything beyond color, `badgeStyles` and `popoverStyles` accept a plain object of CSS properties (camelCase keys, string or number values), merged on top of the module's own defaults.

| Option          | Customizes |
|-----------------|------------|
| `badgeStyles`   | The badge element itself (padding, font, border-radius, etc). |
| `popoverStyles` | The popover panel that holds the input. |

**Example:**

```js
const quill = new Quill(editorContainer, {
  modules: {
    toolbar: toolbarOptions,
    altText: {
      position: 'bottom-right',
      badgeColor: '#1d4ed8',
      missingColor: '#dc2626',
      textColor: '#f0fdf4',
      badgeStyles: {
        fontSize: '11px',
        borderRadius: '6px',
      },
    },
  },
  theme: 'snow',
});
```

---

## [TypeScript](#typescript)

This package ships TypeScript definitions. The option and position types are exported for use in your own code:

```ts
import AltText from 'quill-image-alt';
import type { AltTextOptions, BadgePosition } from 'quill-image-alt';

const position: BadgePosition = 'bottom-right';

const options: AltTextOptions = {
  position,
  badgeColor: '#1d4ed8',
  placeholder: 'Describe this image…',
};
```

---

## [Cleanup / Destroy](#cleanup--destroy)

If you're dynamically mounting and unmounting the Quill editor (for example in a Single Page Application or during route changes), it's important to properly **clean up** the `quill-image-alt` module to avoid memory leaks or event duplication.

This module provides a `destroy()` method that you can call when tearing down your Quill instance.

### [Usage](#usage-1)

Call `destroy()` **before** clearing the DOM:

```js
const altTextModule = quill.getModule('altText');

if (altTextModule?.destroy) {
  altTextModule.destroy();
}

container.innerHTML = '';
```

### [When to use](#when-to-use)

- If you're unmounting your editor component
- If you're switching pages in an SPA
- If you're reinitializing Quill manually

### [Example with unmount](#example-with-unmount)

```js
useEffect(() => {
  const quill = new Quill(editorRef.current, { ... });

  return () => {
    const module = quill.getModule('altText');
    if (module?.destroy) module.destroy();
    editorRef.current.innerHTML = '';
  };
}, []);
```

---

## [Problems](#problems)

### <ins>Problem: The badge or popover renders outside the editor when you scroll</ins>

The badge and popover are attached directly to `.ql-container` (a sibling of `.ql-editor`, not a child of it). If your `.ql-container` has a fixed height like this:

```css
.ql-container {
  height: 500px;
}
```

there's nothing clipping or scrolling that content along with the editor, so as you scroll, the badge/popover can end up rendered outside the editor's box instead of moving with it. Instead, use `min-height` and `max-height`:

```css
.ql-container {
  min-height: 500px;
  max-height: 500px;
  overflow: auto;
}
```

This makes `.ql-container` itself the actual scrolling element, which keeps the badge and popover correctly contained and repositioned as you scroll. ( This is a standard problem I've seen with this Editor combined with other modules )

## [License](#license)

MIT License.
Free for personal and commercial use.

---
> [!NOTE]
> If you encounter any bugs, memory leaks, or unexpected behavior, feel free to open an issue on the [GitHub repository](https://github.com/littlenines/quill-image-alt/issues).
> Your feedback helps make the module better for everyone.
> If you want to contribute to the project — whether it's fixing a bug or improving performance — your contributions are welcome and appreciated.

> [!TIP]
> If you just want the code and prefer to build your own module on top of it, you're free to do that.
> Everything is located in the `/src` directory for full access and customization.
