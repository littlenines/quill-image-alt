import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IME_PROCESSING_KEY_CODE, KEY } from '../../src/constants'
import { getBadge, openPopover, setupController } from '../helpers/controller'

describe('AltTextUIController: popover', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('saves alt text on Enter and clears the missing flag', () => {
    const { container, controller, img } = setupController()
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'A helpful description'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, bubbles: true }))

    expect(img.getAttribute('alt')).toBe('A helpful description')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
    expect(getBadge(container).classList.contains('is-missing')).toBe(false)
  })

  it('keeps an open popover locked to its image when a different image is hovered', () => {
    const { container, controller, img: imgA } = setupController()
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

    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, bubbles: true }))

    expect(imgA.getAttribute('alt')).toBe('description for A')
    expect(imgB.getAttribute('alt')).toBeNull()
  })

  it('discards the draft on Escape without touching alt text', () => {
    const { container, controller, img } = setupController()
    img.setAttribute('alt', 'original')
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'discarded edit'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ESCAPE, bubbles: true }))

    expect(img.getAttribute('alt')).toBe('original')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
  })

  it('saves via the Save button, not just Enter', () => {
    const { container, controller, img } = setupController()
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
    const { container, controller, img } = setupController()
    controller.notifyHover(img, true)
    getBadge(container).dispatchEvent(new Event('click'))

    const input = container.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'saved via enter'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, bubbles: true }))

    expect(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))).not.toThrow()
    expect(img.getAttribute('alt')).toBe('saved via enter')
  })
  it('does not let a mousedown anywhere in the popover except the input steal focus', () => {
    const { container, controller, img } = setupController()
    const { input, saveButton, hint, popover } = openPopover(container, controller, img)

    for (const target of [hint, saveButton, popover]) {
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      target.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }

    const inInput = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    input.dispatchEvent(inInput)
    expect(inInput.defaultPrevented).toBe(false)
  })

  it('stays open when focus moves from the input to the Save button', () => {
    const { container, controller, img } = setupController()
    const { input, saveButton } = openPopover(container, controller, img)
    input.value = 'still typing'

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: saveButton }))

    expect(container.querySelector('.ql-alt-popover')).not.toBeNull()
    expect(img.getAttribute('alt')).toBeNull()
  })

  it('saves and closes when focus leaves the popover entirely', () => {
    const { container, controller, img } = setupController()
    const { input } = openPopover(container, controller, img)
    input.value = 'saved on blur'

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))

    expect(img.getAttribute('alt')).toBe('saved on blur')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
  })

  it('cancels on Escape from the Save button too, not just the input', () => {
    const { container, controller, img } = setupController()
    img.setAttribute('alt', 'original')
    const { input, saveButton } = openPopover(container, controller, img)
    input.value = 'discarded edit'

    saveButton.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ESCAPE, bubbles: true }))

    expect(img.getAttribute('alt')).toBe('original')
    expect(container.querySelector('.ql-alt-popover')).toBeNull()
  })

  it('ignores Enter while an IME composition is in progress', () => {
    const { container, controller, img } = setupController()
    const { input } = openPopover(container, controller, img)
    input.value = 'にほんご'

    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, isComposing: true, bubbles: true }))
    // Safari reports the composition-confirming Enter with isComposing false but keyCode IME_PROCESSING_KEY_CODE.
    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, keyCode: IME_PROCESSING_KEY_CODE, bubbles: true }))

    expect(container.querySelector('.ql-alt-popover')).not.toBeNull()
    expect(img.getAttribute('alt')).toBeNull()

    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, bubbles: true }))
    expect(img.getAttribute('alt')).toBe('にほんご')
  })
})
