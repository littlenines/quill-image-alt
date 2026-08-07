import { describe, expect, it } from 'vitest'
import { toContainerOffset } from '../src/positioning'

function stubRect(el: HTMLElement, rect: { left: number; top: number }): void {
  el.getBoundingClientRect = () => ({
    left: rect.left,
    top: rect.top,
    right: rect.left,
    bottom: rect.top,
    width: 0,
    height: 0,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  })
}

describe('toContainerOffset', () => {
  it('converts a viewport point into coordinates relative to the offsetParent', () => {
    const container = document.createElement('div')
    stubRect(container, { left: 50, top: 20 })

    const target = document.createElement('div')
    Object.defineProperty(target, 'offsetParent', { value: container, configurable: true })

    const offset = toContainerOffset(target, container, { x: 130, y: 95 })

    expect(offset).toEqual({ left: 80, top: 75 })
  })

  it('adds the container scroll offset', () => {
    const container = document.createElement('div')
    stubRect(container, { left: 0, top: 0 })
    Object.defineProperty(container, 'scrollLeft', { value: 40, configurable: true })
    Object.defineProperty(container, 'scrollTop', { value: 15, configurable: true })

    const target = document.createElement('div')
    Object.defineProperty(target, 'offsetParent', { value: container, configurable: true })

    const offset = toContainerOffset(target, container, { x: 10, y: 10 })

    expect(offset).toEqual({ left: 50, top: 25 })
  })

  it('falls back to the given parent when the target has no offsetParent yet', () => {
    const fallbackParent = document.createElement('div')
    stubRect(fallbackParent, { left: 5, top: 5 })

    const target = document.createElement('div')

    const offset = toContainerOffset(target, fallbackParent, { x: 25, y: 35 })

    expect(offset).toEqual({ left: 20, top: 30 })
  })
})
