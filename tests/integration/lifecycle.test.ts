import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Quill from 'quill'
import { KEY } from '../../src/constants'
import { PIXEL_PNG, setupEditor } from '../helpers/editor'

describe('AltText module: lifecycle', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('saves alt text through the badge -> popover flow and it lands on the real image blot', () => {
    const { quill, img } = setupEditor()

    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    badge?.dispatchEvent(new Event('click'))

    const input = quill.root.parentElement?.querySelector<HTMLInputElement>('.ql-alt-input')
    if (!input) throw new Error('input not found')
    input.value = 'A pixel used for testing'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: KEY.ENTER, bubbles: true }))

    expect(img.getAttribute('alt')).toBe('A pixel used for testing')
  })

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
