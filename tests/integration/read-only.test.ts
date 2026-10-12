import { afterEach, describe, expect, it } from 'vitest'
import Quill from 'quill'
import { PIXEL_PNG, setupEditor } from '../helpers/editor'

describe('AltText module: read-only editors', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('ignores hover and selection while the editor is read-only', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)
    const quill = new Quill(editorEl, { readOnly: true, modules: { altText: true } })
    quill.setContents([{ insert: { image: PIXEL_PNG } }, { insert: '\n' }])
    const img = quill.root.querySelector('img')
    if (!img) throw new Error('image not inserted')
    const badgeDisplay = () => quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')?.style.display

    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(badgeDisplay()).not.toBe('flex')

    quill.setSelection(0, 1, 'api')
    expect(badgeDisplay()).not.toBe('flex')
  })

  it('does not open the popover if the editor became read-only after the badge was shown', () => {
    const { quill, img } = setupEditor()

    img.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    quill.disable()
    quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')?.dispatchEvent(new Event('click'))

    expect(quill.root.parentElement?.querySelector('.ql-alt-popover')).toBeNull()
  })
})
