import { POSITION_ANCHORS, type ResolvedAltTextOptions } from '../constants'
import { toContainerOffset } from '../positioning'

export interface BadgeCallbacks {
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export class BadgeManager {
  private parent: HTMLElement
  private options: ResolvedAltTextOptions
  private callbacks: BadgeCallbacks
  element: HTMLButtonElement | null = null
  private listeners: AbortController | null = null

  constructor(parent: HTMLElement, options: ResolvedAltTextOptions, callbacks: BadgeCallbacks) {
    this.parent = parent
    this.options = options
    this.callbacks = callbacks
  }

  create(): HTMLButtonElement {
    if (this.element) return this.element

    const badge = document.createElement('button')
    badge.type = 'button'
    badge.className = `ql-alt-badge ${POSITION_ANCHORS[this.options.position].className}`
    badge.textContent = this.options.badgeText

    badge.style.setProperty('--ql-alt-badge-bg', this.options.badgeColor)
    badge.style.setProperty('--ql-alt-badge-missing-bg', this.options.missingColor)
    badge.style.setProperty('--ql-alt-badge-text', this.options.textColor)
    Object.assign(badge.style, this.options.badgeStyles)

    this.listeners = new AbortController()
    const { signal } = this.listeners

    badge.addEventListener('click', this.callbacks.onClick, { signal })
    badge.addEventListener('mouseenter', this.callbacks.onMouseEnter, { signal })
    badge.addEventListener('mouseleave', this.callbacks.onMouseLeave, { signal })

    this.parent.appendChild(badge)
    this.element = badge
    
    return badge
  }

  setMissing(missing: boolean): void {
    this.element?.classList.toggle('is-missing', missing)
  }

  show(): void {
    if (this.element) this.element.style.display = 'flex'
  }

  hide(): void {
    if (this.element) this.element.style.display = 'none'
  }

  reposition(img: HTMLImageElement): void {
    if (!this.element) return

    const anchor = POSITION_ANCHORS[this.options.position]
    const imgRect = img.getBoundingClientRect()

    const offset = toContainerOffset(this.element, this.parent, {
      x: imgRect.left + imgRect.width * anchor.xRatio,
      y: imgRect.top + imgRect.height * anchor.yRatio,
    })

    Object.assign(this.element.style, { left: `${offset.left}px`, top: `${offset.top}px` })
  }

  remove(): void {
    const element = this.element
    this.element = null

    this.listeners?.abort()
    this.listeners = null

    element?.remove()
  }
}
