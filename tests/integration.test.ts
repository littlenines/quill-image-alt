import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Quill from 'quill'
import AltText from '../src'

Quill.register('modules/altText', AltText)

const PIXEL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

function setup() {
  const editorEl = document.createElement('div')
  document.body.appendChild(editorEl)
  const quill = new Quill(editorEl, { modules: { altText: true } })
  quill.setContents([{ insert: { image: PIXEL_PNG } }, { insert: '\n' }])
  const img = quill.root.querySelector('img')
  if (!img) throw new Error('image not inserted')
  return { quill, img }
}

describe('AltText module (wired into a real Quill instance)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the badge when the image is hovered', () => {
    const { quill, img } = setup()

    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
  })

  it('falls back to the default position instead of throwing, when given an invalid one', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quill = new Quill(editorEl, { modules: { altText: { position: 'center' as any } } })
    quill.setContents([{ insert: { image: PIXEL_PNG } }, { insert: '\n' }])
    const img = quill.root.querySelector('img')
    if (!img) throw new Error('image not inserted')

    expect(() => img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))).not.toThrow()

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
    expect(badge?.classList.contains('ql-alt-anchor-top-center')).toBe(true)
  })

  it('shows the badge on selection alone, without any hover event', () => {
    const { quill } = setup()

    quill.setSelection(0, 1, 'api')

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
  })

  it('shows the badge on a silent selection change, like resize-quill-image uses to select an image', () => {
    const { quill } = setup()

    quill.setSelection(0, 1, 'silent')

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
  })

  it('saves alt text through the badge -> popover flow and it lands on the real image blot', () => {
    const { quill, img } = setup()

    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    badge?.dispatchEvent(new Event('click'))

    const input = quill.root.parentElement?.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'A pixel used for testing'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    expect(img.getAttribute('alt')).toBe('A pixel used for testing')
  })

  describe('module lifecycle', () => {
    let quill: Quill
    let editorEl: HTMLDivElement

    beforeEach(() => {
      editorEl = document.createElement('div')
      document.body.appendChild(editorEl)
      quill = new Quill(editorEl, { modules: { altText: true } })
      quill.setContents([{ insert: { image: PIXEL_PNG } }, { insert: '\n' }])
    })

    it('hides the badge once the image is deleted from the document', () => {
      const img = quill.root.querySelector('img')
      if (!img) throw new Error('image not inserted')
      img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      quill.setText('replaced\n')

      const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
      expect(badge?.style.display).toBe('none')
    })

    it('destroy() removes the badge/popover and stops responding to further hover events', () => {
      const img = quill.root.querySelector('img')
      if (!img) throw new Error('image not inserted')
      img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      const module = quill.getModule('altText') as { destroy: () => void }
      expect(() => module.destroy()).not.toThrow()

      expect(quill.root.parentElement?.querySelector('.ql-alt-badge')).toBeNull()

      // Should no longer react - listeners were removed by destroy().
      img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      expect(quill.root.parentElement?.querySelector('.ql-alt-badge')).toBeNull()
    })
  })
})
