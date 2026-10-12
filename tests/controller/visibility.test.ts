import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HIDE_DELAY } from '../../src/constants'
import { getBadge, setupController } from '../helpers/controller'

describe('AltTextUIController: badge visibility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows the badge on hover, flagged as missing when there is no alt text', () => {
    const { container, controller, img } = setupController()

    controller.notifyHover(img, true)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(badge.classList.contains('is-missing')).toBe(true)
    expect(controller.img).toBe(img)
  })

  it('does not flag the badge as missing once the image has alt text', () => {
    const { container, controller, img } = setupController()
    img.setAttribute('alt', 'existing description')

    controller.notifyHover(img, true)

    expect(getBadge(container).classList.contains('is-missing')).toBe(false)
  })

  it('hides after the delay once the mouse leaves and nothing else holds it open', () => {
    const { container, controller, img } = setupController()

    controller.notifyHover(img, true)
    controller.notifyHover(img, false)
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(getBadge(container).style.display).toBe('none')
    expect(controller.img).toBeNull()
  })

  it('keeps the badge visible while hovering the badge itself, even after leaving the image', () => {
    const { container, controller, img } = setupController()

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
    const { container, controller, img } = setupController()

    controller.notifySelection(img)

    const badge = getBadge(container)
    expect(badge.style.display).toBe('flex')
    expect(controller.img).toBe(img)

    controller.notifySelection(null)
    vi.advanceTimersByTime(HIDE_DELAY)

    expect(badge.style.display).toBe('none')
  })

  it('does not let a stale mouseout for a previous image hide the badge for the current one', () => {
    const { container, controller, img: imgA } = setupController()
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
    const { container, controller, img: imgA } = setupController()
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
})
