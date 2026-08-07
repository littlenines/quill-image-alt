export type BadgePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface AltTextOptions {
  badgeText?: string
  placeholder?: string
  position?: BadgePosition
  badgeColor?: string
  missingColor?: string
  textColor?: string
  badgeStyles?: Partial<CSSStyleDeclaration>
  popoverStyles?: Partial<CSSStyleDeclaration>
}

export interface ResolvedAltTextOptions {
  badgeText: string
  placeholder: string
  position: BadgePosition
  badgeColor: string
  missingColor: string
  textColor: string
  badgeStyles: Partial<CSSStyleDeclaration>
  popoverStyles: Partial<CSSStyleDeclaration>
}

export const DEFAULT_OPTIONS: ResolvedAltTextOptions = {
  badgeText: 'ALT',
  placeholder: 'Describe this image…',
  position: 'top-center',
  badgeColor: '#333',
  missingColor: '#d9822b',
  textColor: '#fff',
  badgeStyles: {},
  popoverStyles: {},
}

export const HIDE_DELAY = 200

interface PositionAnchor {
  xRatio: number
  yRatio: number
  className: string
}

export const POSITION_ANCHORS: Record<BadgePosition, PositionAnchor> = {
  'top-left': { xRatio: 0, yRatio: 0, className: 'ql-alt-anchor-top-left' },
  'top-center': { xRatio: 0.5, yRatio: 0, className: 'ql-alt-anchor-top-center' },
  'top-right': { xRatio: 1, yRatio: 0, className: 'ql-alt-anchor-top-right' },
  'bottom-left': { xRatio: 0, yRatio: 1, className: 'ql-alt-anchor-bottom-left' },
  'bottom-center': { xRatio: 0.5, yRatio: 1, className: 'ql-alt-anchor-bottom-center' },
  'bottom-right': { xRatio: 1, yRatio: 1, className: 'ql-alt-anchor-bottom-right' },
}

export function resolvePosition(value: string | undefined): BadgePosition {
  if (value !== undefined && value in POSITION_ANCHORS) return value as BadgePosition
  return DEFAULT_OPTIONS.position
}
