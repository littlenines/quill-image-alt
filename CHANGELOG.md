# Changelog

All notable changes to this project will be documented in this file.

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
