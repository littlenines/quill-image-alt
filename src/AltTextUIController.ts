import { BadgeManager } from './managers/BadgeManager'
import { PopoverManager } from './managers/PopoverManager'
import { HIDE_DELAY, type ResolvedAltTextOptions } from './constants'

export class AltTextUIController {
  img: HTMLImageElement | null = null

  private readonly parent: HTMLElement
  private readonly options: ResolvedAltTextOptions

  private badgeManager: BadgeManager
  private popoverManager: PopoverManager | null = null
  private hoveredImg: HTMLImageElement | null = null
  private selectedImg: HTMLImageElement | null = null

  private isHoveringBadge = false
  private hideTimer: ReturnType<typeof setTimeout> | null = null

  constructor(parent: HTMLElement, options: ResolvedAltTextOptions) {
    this.parent = parent
    this.options = options

    this.badgeManager = new BadgeManager(parent, options, {
      onClick: () => this.openPopover(),
      onMouseEnter: () => {
        this.isHoveringBadge = true
        this.cancelHide()
      },
      onMouseLeave: () => {
        this.isHoveringBadge = false
        this.scheduleHide()
      },
    })
  }

  notifyHover(img: HTMLImageElement, hovering: boolean): void {
    if (hovering) {
      this.hoveredImg = img
      this.cancelHide()
      if (!this.isEditingAnotherImage(img)) this.show(img)
    } else {
      if (this.hoveredImg === img) this.hoveredImg = null
      this.scheduleHide()
    }
  }

  notifySelection(img: HTMLImageElement | null): void {
    this.selectedImg = img

    if (img) {
      this.cancelHide()
      if (!this.isEditingAnotherImage(img)) this.show(img)
    } else {
      this.scheduleHide()
    }
  }

  private isEditingAnotherImage(img: HTMLImageElement): boolean {
    return this.popoverManager !== null && this.img !== img
  }

  notifyRemoved(): void {
    this.hoveredImg = null
    this.isHoveringBadge = false
    this.selectedImg = null
    this.cancelHide()
    this.popoverManager?.remove()
    this.popoverManager = null
    this.badgeManager.hide()
    this.img = null
  }

  update(): void {
    if (!this.img) return

    this.badgeManager.reposition(this.img)
    this.repositionPopoverIfOpen()
  }

  destroy(): void {
    this.cancelHide()
    this.popoverManager?.remove()
    this.badgeManager.remove()
    this.popoverManager = null
    this.img = null
  }

  private show(img: HTMLImageElement): void {
    this.img = img
    this.badgeManager.create()
    this.badgeManager.setMissing(!img.getAttribute('alt'))
    this.badgeManager.show()
    this.badgeManager.reposition(img)
    this.repositionPopoverIfOpen()
  }

  private repositionPopoverIfOpen(): void {
    if (this.popoverManager && this.badgeManager.element) {
      this.popoverManager.reposition(this.badgeManager.element)
    }
  }

  private scheduleHide(): void {
    this.cancelHide()

    this.hideTimer = setTimeout(() => {
      if (this.isHoveringBadge || this.popoverManager) return

      const fallback = this.hoveredImg ?? this.selectedImg
      if (fallback) {
        this.show(fallback)
        return
      }

      this.badgeManager.hide()
      this.img = null
    }, HIDE_DELAY)
  }

  private cancelHide(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
  }

  private openPopover(): void {
    if (!this.img || !this.badgeManager.element) return

    this.cancelHide()
    this.popoverManager?.remove()

    const popoverManager = new PopoverManager(this.parent, this.options, {
      onSave: (value) => this.closePopover(value.trim()),
      onCancel: () => this.closePopover(null),
    })

    popoverManager.create(this.img.getAttribute('alt') ?? '', this.badgeManager.element)

    this.popoverManager = popoverManager
  }

  private closePopover(value: string | null): void {
    const popover = this.popoverManager
    const img = this.img

    if (!popover) return

    this.popoverManager = null

    if (value !== null && img) {
      if (value) img.setAttribute('alt', value)
      else img.removeAttribute('alt')

      this.badgeManager.setMissing(!value)
    }

    popover.remove()
    this.scheduleHide()
  }
}
