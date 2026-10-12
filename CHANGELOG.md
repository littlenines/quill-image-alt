# Changelog

All notable changes to this project will be documented in this file.

## [0.1.6] - 12-10-2026

### Fixed
- `destroy()` threw `NotFoundError` in Chrome when called while the alt-text popover was open, leaving the badge behind and saving the half-typed text, it now tears down cleanly and discards the draft
- Read-only editors (`readOnly: true` or `quill.disable()`) no longer show the badge or let alt text be edited
- Clicking inside the popover (its padding or the hint) no longer closes it and saves the partial text, Tab to the Save button keeps it open, and Escape cancels from the Save button too
- Pressing Enter to confirm an IME composition (Japanese, Chinese, Korean input) no longer saves the alt text mid-composition, including in Safari

## [0.1.5] - 12-10-2026

### Fixed
- Alt badge no longer appears when clicking beside an image — a plain cursor next to the image was treated as selecting it

## [0.1.4] - 28-09-2026

### Changed
- Type declarations are now built with `unplugin-dts` (replacing the deprecated `vite-plugin-dts`); the published bundle and typings are unchanged

## [0.1.3] - 07-08-2026

### Added
- Readme with Demo example

## [0.1.2] - 07-08-2026

- Initial publish

## [0.1.1] - 07-08-2026
### Added
- Save button in the alt-text popover — Enter is no longer the only way to save
- `name` attribute on the alt-text input

### Changed
- Removed the separate Cancel button
- `peerDependencies.quill` range widened to `>=1.3.7`

## [0.1.0] - 07-08-2026
### Added
- Initial release
- Hover (or select) an image to show a small badge anchored to it, orange when `alt` text is missing
- Click the badge to open an inline popover and set or edit the description, with a Save button plus Enter/Esc keyboard shortcuts
- `position` option for where the badge sits (`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`)
- `badgeColor`, `missingColor`, `textColor`, `badgeStyles`, `popoverStyles` options for customizing appearance
- TypeScript definitions shipped with the package
- ES, CJS, and IIFE (CDN) builds
