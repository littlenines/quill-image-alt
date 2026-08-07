import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AltTextUIController } from '../src/AltTextUIController'
import { DEFAULT_OPTIONS, HIDE_DELAY } from '../src/constants'

function setup() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const controller = new AltTextUIController(container, DEFAULT_OPTIONS)
  const img = document.createElement('img')
  container.appendChild(img)
  return { container, controller, img }
}

function getBadge(container: HTMLElement): HTMLButtonElement {
  const badge = container.querySelector<HTMLButtonElement>('.ql-alt-badge')
  if (!badge) throw new Error('badge not found')
  return badge
}

describe('AltTextUIController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows the badge on hover, flagged as missing when there is no alt text', () => {
    const { container, controller, img } = setup()

    controller.notifyHover(img, true)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(badge.classList.contains('is-missing')).toBe(true)
    expect(controller.img).toBe(img)
  })

  it('does not flag the badge as missing once the image has alt text', () => {
    const { container, controller, img } = setup()
    img.setAttribute('alt', 'existing description')

    controller.notifyHover(img, true)

    expect(getBadge(container).classList.contains('is-missing')).toBe(false)
  })

  it('hides after the delay once the mouse leaves and nothing else holds it open', () => {
    const { container, controller, img } = setup()

    controller.notifyHover(img, true)
    controller.notifyHover(img, false)
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(getBadge(container).style.display).toBe('none')
    expect(controller.img).toBeNull()
  })

  it('keeps the badge visible while hovering the badge itself, even after leaving the image', () => {
    const { container, controller, img } = setup()

    controller.notifyHover(img, true)
    const badge = getBadge(container)
    badge.dispatchEvent(new Event('mouseenter'))
    controller.notifyHover(img, false)
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(badge.style.display).toBe('flex')

    badge.dispatchEvent(new Event('mouseleave'))
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(badge.style.display).toBe('none')
  })

  it('keeps the badge visible via selection alone, with no hover at all', () => {
    const { container, controller, img } = setup()

    controller.notifySelection(img)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(controller.img).toBe(img)

    controller.notifySelection(null)
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(badge.style.display).toBe('none')
  })

  it('does not let a stale mouseout for a previous image hide the badge for the current one', () => {
    const { container, controller, img: imgA } = setup()
    const imgB = document.createElement('img')
    container.appendChild(imgB)

    controller.notifyHover(imgA, true)
    expect(controller.img).toBe(imgA)

    // Mouse has already moved onto B
    controller.notifyHover(imgB, true)
    expect(controller.img).toBe(imgB)

    // but A's mouseout arrives late, after B's mouseover.
    controller.notifyHover(imgA, false)
    vi.advanceTimersByTime(HIDE_DELAY)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(controller.img).toBe(imgB)
  })

  it('falls back to the selected image instead of hiding, when hover on a different image ends', () => {
    const { container, controller, img: imgA } = setup()
    const imgB = document.createElement('img')
    container.appendChild(imgB)

    controller.notifySelection(imgA)
    expect(controller.img).toBe(imgA)

    controller.notifyHover(imgB, true)
    expect(controller.img).toBe(imgB)

    controller.notifyHover(imgB, false)
    vi.advanceTimersByTime(HIDE_DELAY)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(controller.img).toBe(imgA)
  })

  it('saves alt text on Enter and clears the missing flag', () => {
    const { container, controller, img } = setup()
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'A helpful description'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(img.getAttribute('alt')).toBe('A helpful description')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
    expect(getBadge(container).classList.contains('is-missing')).toBe(false)
  })

  it('keeps an open popover locked to its image when a different image is hovered', () => {
    const { container, controller, img: imgA } = setup()
    const imgB = document.createElement('img')
    container.appendChild(imgB)

    controller.notifyHover(imgA, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'description for A'

    controller.notifyHover(imgB, true)

    expect(controller.img).toBe(imgA)
    expect(container.querySelector('.ql-alt-popover')).not.toBeNull()

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(imgA.getAttribute('alt')).toBe('description for A')
    expect(imgB.getAttribute('alt')).toBeNull()
  })

  it('discards the draft on Escape without touching alt text', () => {
    const { container, controller, img } = setup()
    img.setAttribute('alt', 'original')
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'discarded edit'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(img.getAttribute('alt')).toBe('original')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
  })

  it('saves via the Save button, not just Enter', () => {
    const { container, controller, img } = setup()
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'saved via button'

    const saveButton = container.querySelector<HTMLButtonElement>('.ql-alt-save')
    if (!saveButton) throw new Error('save button not found')
    saveButton.click()

    expect(img.getAttribute('alt')).toBe('saved via button')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
  })

  it('survives a reentrant blur firing after the popover was already closed', () => {
    const { container, controller, img } = setup()
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'saved via enter'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(() => input.dispatchEvent(new Event('blur'))).not.toThrow()
    expect(img.getAttribute('alt')).toBe('saved via enter')
  })
})
