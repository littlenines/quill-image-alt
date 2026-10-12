import { afterEach, describe, expect, it } from 'vitest'
import Quill from 'quill'
import { PIXEL_PNG, setupEditor } from '../helpers/editor'

describe('AltText module: hover', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the badge when the image is hovered', () => {
    const { quill, img } = setupEditor()

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
})
