import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HIDE_DELAY } from '../../src/constants'
import { emulateBlurOnRemoval, getBadge, openPopover, setupController } from '../helpers/controller'

describe('AltTextUIController: teardown with the popover open and focused', () => {
  let removeSpy: ReturnType<typeof emulateBlurOnRemoval>

  beforeEach(() => {
    vi.useFakeTimers()
    removeSpy = emulateBlurOnRemoval()
  })

  afterEach(() => {
    removeSpy.mockRestore()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('destroy() does not throw, leaves nothing behind and does not save the draft', () => {
    const { container, controller, img } = setupController()
    img.setAttribute('alt', 'original')
    const { input } = openPopover(container, controller, img)
    input.value = 'half-typed draft'
    expect(document.activeElement).toBe(input)

    expect(() => controller.destroy()).not.toThrow()
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(container.querySelector('.ql-alt-popover')).toBeNull()
    expect(container.querySelector('.ql-alt-badge')).toBeNull()
    expect(img.getAttribute('alt')).toBe('original')
  })

  it('notifyRemoved() does not throw and hides everything', () => {
    const { container, controller, img } = setupController()
    const { input } = openPopover(container, controller, img)
    input.value = 'draft for a deleted image'

    expect(() => controller.notifyRemoved()).not.toThrow()
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(container.querySelector('.ql-alt-popover')).toBeNull()
    expect(getBadge(container).style.display).toBe('none')
    expect(controller.img).toBeNull()
  })
})
