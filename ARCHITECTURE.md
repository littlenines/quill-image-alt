# How quill-image-alt works

This doc walks through the `src/` folder and explains what each piece does and why it exists.

---

When a user hovers (or selects) an image inside Quill, we need to show a small badge anchored to it, open an inline text input when it's clicked, and save whatever gets typed back onto the image's `alt` attribute. When the user moves on, everything disappears cleanly.

The code is split into a main entry point (`index.ts`), a coordinator (`AltTextUIController.ts`), and a set of focused manager classes, each owning one piece of the UI.

```
src/
├── constants.ts               — options, defaults, and badge position math
├── css.ts                     — the module's self-contained CSS, as a plain string
├── injectStyles.ts            — appends css.ts's CSS to <head>, once
├── positioning.ts             — shared "viewport point → container-relative offset" math
├── index.ts                   — the Quill module, handles events
├── AltTextUIController.ts     — creates and coordinates the managers, owns visibility policy
└── managers/
    ├── BadgeManager.ts        — the "ALT" badge anchored to the image
    └── PopoverManager.ts      — the input that edits the alt text
```

---

## `index.ts` — the entry point

This is what Quill sees. It extends Quill's `Module` class and gets instantiated automatically when you add `altText` to the modules config.

The constructor does three things:
1. Merges your options with the defaults. `badgeStyles` and `popoverStyles` are merged independently, so passing `badgeStyles: { fontSize: '11px' }` keeps the rest of the badge's defaults instead of wiping them out.
2. Calls `injectStyles()` once, so the module works without any separate CSS import.
3. Creates an `AltTextUIController` and wires up four event listeners.

The events it listens to:

- **`mouseover` / `mouseout` on `quill.root`** — if the target is an `<img>`, tell the controller the user is hovering it (or has stopped).
- **`scroll` on `quill.root`** — reposition the badge/popover if the editor scrolled under them.
- **Quill `editor-change`** — fans out to selection and content changes (see below), rather than subscribing to `selection-change`/`text-change` directly.

**Why `editor-change` and not `selection-change`/`text-change` directly**: Quill only emits those two *direct* events when the change's source isn't `'silent'` (see `core/selection.js` / `core/quill.js` — the direct emit is wrapped in `if (source !== Emitter.sources.SILENT)`). `resize-quill-image`, among others, selects an image via `quill.setSelection(index, length, 'silent')` specifically to avoid triggering other listeners' side effects — which means a plain `quill.on('selection-change', ...)` handler never fires for it at all. `editor-change` fires unconditionally regardless of source, so `handleEditorChange(name, range)` subscribes to that instead and checks `name` itself:
- `name === 'selection-change'` — if the selection lands on an image blot, tell the controller it's selected; if not, tell it nothing is.
- `name === 'text-change'` — if content changes while an image is active (e.g. it gets deleted, or the layout shifts), check whether that image still exists in the editor and notify the controller accordingly.

`findImageAt()` resolves a Quill document index to the actual `<img>` DOM node, via `quill.scroll.descendant(...)` against the `ImageBlot` class. That class is resolved once, as a module-level constant (`Quill.import('formats/image')`), rather than on every selection change.

`destroy()` is the cleanup method: it removes all four listeners and calls `uiController.destroy()`. See the [Lifecycle](#cleanup--memory-leaks) section at the bottom.

---

## `constants.ts` — options, defaults, and position math

`DEFAULT_OPTIONS` is the source of truth for every default value — badge text, placeholder, colors, position. Keeping it here means `index.ts` and the managers don't have scattered magic values.

`POSITION_ANCHORS` maps each of the six `BadgePosition` values (`top-left`, `top-center`, ..., `bottom-right`) to an `{ xRatio, yRatio, className }` triple:

- `xRatio` / `yRatio` say where along the image's width/height the badge's anchor point sits (`0` = left/top edge, `1` = right/bottom edge, `0.5` = center).
- `className` is a CSS class (defined in `css.ts`) that pulls the badge outward from that point via `transform`, so it straddles the image's border instead of sitting fully inside or fully outside it.

`HIDE_DELAY` is the grace period (200ms) before the badge disappears after the last reason to show it goes away — long enough for the mouse to travel from the image to the badge itself without it vanishing first.

`resolvePosition(value)` validates a `position` option against `POSITION_ANCHORS`, falling back to the default if it isn't one of the six known keys. This matters because plain-JS/CDN consumers can pass any string here — TypeScript's `BadgePosition` union isn't enforced at runtime — and an unrecognized value used to reach `POSITION_ANCHORS[value]` as `undefined` and throw on first hover instead of falling back safely.

---

## `css.ts` / `injectStyles.ts` — the injected stylesheet

The idea: this module ships its own look, so consumers don't need a separate CSS import for it to render correctly. `css.ts` is just the CSS text as a plain string constant (`CSS`) — kept in its own file since it's long enough to otherwise dominate whatever file it sits in.

`injectStyles()` (in `injectStyles.ts`) appends a single `<style>` tag containing that CSS to `document.head`, guarded by an element ID so a second `AltText` instance (or a second bundle importing the module twice) doesn't inject it again.

Per-instance colors (`badgeColor`, `missingColor`, `textColor`) are **not** baked into this stylesheet — they're set as CSS custom properties on each badge element by `BadgeManager` (see below), and this stylesheet just reads them with a `var(..., fallback)`. That split is what lets `.is-missing` still swap the background color via a class even when a consumer has customized the base color: an inline `background` would out-specificity the class and never let go, but a custom property doesn't have that problem.

---

## `positioning.ts` — shared coordinate math

One function, `toContainerOffset(target, fallbackParent, point)`, used by both managers to convert a viewport-space point into coordinates relative to whatever container `target` is actually positioned against.

The tricky part: you can't just use `img.offsetTop`, because that's relative to the image's own offset parent, which usually isn't the same element the badge/popover are positioned against. Instead this takes `target.offsetParent` (falling back to `fallbackParent` if the element isn't attached to the DOM yet), calls `getBoundingClientRect()` on it, and subtracts that from the target point — then adds `scrollLeft`/`scrollTop` to compensate for any scroll inside the editor container.

Pulling this into its own function (rather than duplicating it in both managers, which is how it started) means a future fix to the offset math only has to happen once.

---

## `AltTextUIController.ts` — the coordinator

`index.ts` doesn't talk to the managers directly — it goes through `AltTextUIController`, via four `notify*` methods plus `update()`. This keeps the Quill event-wiring code separate from the "should the badge still be visible?" policy.

That policy is the most subtle part of the module. The badge has to survive **three independent, overlapping reasons** to stay on screen:

1. **Hovering the image** (`hoveredImg`)
2. **Hovering the badge itself** (`isHoveringBadge`) — so moving the mouse from the image to the badge to click it doesn't hide the badge mid-transit
3. **The image being Quill's current selection** (`selectedImg`) — this matters because a selection overlay drawn on top of the image (from another module, or a future feature of this one) can end up sitting above the `<img>` and swallowing further `mouseover`/`mouseout` on it. Without this, selecting such an image would make the alt-text badge unreachable by hover alone.

These are tracked **by image identity**, not as plain booleans. A stale or reordered `mouseout` for an image the user has already moved on from (plausible if something else is intercepting mouse events on the image, as described above) must not be able to clear hover state that now belongs to a different image — see the comment on `notifyHover()`. `scheduleHide()`'s timeout callback re-checks `hoveredImg`/`selectedImg` against whatever is *currently* displayed at fire-time, not a snapshot from when the timer was set — and rather than hiding the instant neither one matches `this.img`, it falls back to showing whichever of the two is still active (hover wins over selection) instead of hiding outright. That's what lets the badge hand off cleanly from a hovered image back to a still-selected one, instead of disappearing in between.

**A fourth rule sits above all three**: while a popover is open, `this.img` is locked to whichever image it belongs to. `notifyHover()`/`notifySelection()` still update `hoveredImg`/`selectedImg` for bookkeeping when a *different* image is hovered or selected, but skip calling `show()` for it — see `isEditingAnotherImage()`. Without this, hovering image B while image A's popover was still open would reassign `this.img` to B, dragging the open popover (still holding A's unsaved text) onto B, and saving from there would write that text onto B's `alt` attribute instead of A's.

**`show(img)`** creates the badge if needed, sets its "missing alt text" state, and repositions it (and the popover, if one is open, via `repositionPopoverIfOpen()`) against the given image.

**`scheduleHide()` / `cancelHide()`** manage the 200ms grace-period timer described above.

**`openPopover()` / `closePopover(value)`** create and tear down the `PopoverManager`. `closePopover` takes `string | null`: a string saves that value (or clears `alt` if empty), `null` discards the edit. It clears `this.popoverManager` to `null` **before** calling `popover.remove()` — removing a focused `<input>` fires a synchronous `blur`, which re-enters `closePopover()`, and nulling the field first turns that re-entrant call into a no-op instead of a double-removal.

---

## `managers/BadgeManager.ts` — the badge

Creates a single `<button>` positioned absolute against the module's parent container (`quill.root.parentNode`).

Colors are set as CSS custom properties (`--ql-alt-badge-bg`, `--ql-alt-badge-missing-bg`, `--ql-alt-badge-text`) rather than direct `background`/`color`, for the reason explained in the `css.ts` / `injectStyles.ts` section above. `badgeStyles` is applied afterward via `Object.assign`, so it can still override anything if a consumer needs to.

`reposition(img)` looks up the current `PositionAnchor` for the configured `position`, computes the anchor point on the image (`imgRect.left + imgRect.width * xRatio`, etc.), and hands it to `toContainerOffset()`.

---

## `managers/PopoverManager.ts` — the input

Creates the small panel with the `<input>` and a Save icon button sharing a single row (`.ql-alt-row`), plus the "Enter to save · Esc to cancel" hint below it — positioned just below wherever the badge currently is. The Save button exists because Enter-to-save alone isn't discoverable; there's no separate Cancel button — Escape (or clicking away, which saves via `blur`) already covers that, and a second button for it wasn't worth the extra width. The hint stays for keyboard users who don't need to reach for the mouse. Since the icon carries no visible text, the button has an explicit `aria-label` (and `title` for a hover tooltip) so its purpose is still conveyed non-visually.

`create()` calls `reposition(anchorEl)` **before** calling `input.focus()`. This ordering matters: an absolutely-positioned element with no `top`/`left` set yet renders at its static-flow position — which, appended after all the editor's content, is near the very bottom of the scrollable container. Focusing it there makes the browser auto-scroll the whole container down to reveal it, before the correct position is ever applied. Positioning first avoids that jump entirely.

**The Save button blocks its own `mousedown`'s default action** (`event.preventDefault()`), which stops the input from losing focus when clicked. This matters because the input already has a `blur` handler that unconditionally saves (so clicking anywhere else outside the popover saves your edit) — without the `mousedown` guard, clicking Save would blur the input first (itself triggering a save with whatever's currently typed) before the button's own `click` handler ran a second, redundant save. Blocking the focus shift means blur never fires for this button, and its `click` handler is the only thing that runs.

The input has an explicit `aria-label`, since placeholder text alone isn't reliably exposed as an accessible name by all assistive tech — worth being careful about, given the entire point of this module is authoring accessibility metadata.

---

## How it all flows

```
User hovers an image
       │
       ▼
index.ts: handleMouseOver()
       │
       ▼
AltTextUIController.notifyHover(img, true)
  → BadgeManager: create + setMissing + show + reposition

User clicks the badge
       │
       ▼
AltTextUIController.openPopover()
  → PopoverManager: create (reposition, then focus)

User hovers a *different* image B while A's popover is still open
       │
       ▼
notifyHover(B, true) → hoveredImg = B, but isEditingAnotherImage(B) is
true → show(B) is skipped. Badge/popover stay on A.

User presses Enter
       │
       ▼
AltTextUIController.closePopover(value)
  → img.setAttribute('alt', value)     (img = A, never B)
  → BadgeManager.setMissing(false)
  → PopoverManager.remove()
  → scheduleHide()

User moves the mouse away
       │
       ▼
index.ts: handleMouseOver/Out() → notifyHover(img, false)
       │
       ▼
scheduleHide() → (200ms later)
  → still hovering the badge, or a popover is open?      → do nothing
  → hoveredImg or selectedImg still points at something?  → show() that image instead
  → otherwise                                             → BadgeManager.hide()
```

---

## Cleanup / memory leaks

Every listener this module adds — `mouseover`/`mouseout`/`scroll` on `quill.root`, plus the `editor-change` subscription — is added in `index.ts`'s constructor and removed in its `destroy()`. The managers' own DOM listeners (badge click/hover, input keydown/blur) are removed by each manager's own `remove()`, called from `AltTextUIController.destroy()`.

In React, call it in the `useEffect` cleanup:

```js
return () => {
  const altText = quill.getModule('altText');
  if (altText?.destroy) altText.destroy();
  container.innerHTML = '';
};
```
