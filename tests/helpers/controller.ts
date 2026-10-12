import { vi } from 'vitest'
import { AltTextUIController } from '../../src/AltTextUIController'
import { DEFAULT_OPTIONS } from '../../src/constants'

export function setupController() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const controller = new AltTextUIController(container, DEFAULT_OPTIONS)
  const img = document.createElement('img')
  container.appendChild(img)
  return { container, controller, img }
}

export function getBadge(container: HTMLElement): HTMLButtonElement {
  const badge = container.querySelector<HTMLButtonElement>('.ql-alt-badge')
  if (!badge) throw new Error('badge not found')
  return badge
}

export function openPopover(container: HTMLElement, controller: AltTextUIController, img: HTMLImageElement) {
  controller.notifyHover(img, true)
  getBadge(container).dispatchEvent(new Event('click'))

  const popover = container.querySelector<HTMLDivElement>('.ql-alt-popover')
  const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
  const saveButton = container.querySelector<HTMLButtonElement>('.ql-alt-save')
  const hint = container.querySelector<HTMLSpanElement>('.ql-alt-hint')
  if (!popover || !input || !saveButton || !hint) throw new Error('popover not found')
  return { popover, input, saveButton, hint }
}

// Chrome fires blur/focusout synchronously when a focused element is removed,
// mid-removal - so a handler that removes the same node makes the outer
// removal throw. jsdom doesn't do this, so emulate it.
export function emulateBlurOnRemoval() {
  return vi.spyOn(Element.prototype, 'remove').mockImplementation(function (this: Element) {
    const parent = this.parentNode
    if (!parent) return

    const active = document.activeElement
    if (active instanceof HTMLElement && this.contains(active)) {
      active.dispatchEvent(new FocusEvent('blur'))
      active.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    }

    parent.removeChild(this)
  })
}
