import { afterEach, describe, expect, it, vi } from 'vitest'
import Quill from 'quill'
import { PIXEL_PNG, setupEditor } from '../helpers/editor'

describe('AltText module: selection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the badge on selection alone, without any hover event', () => {
    const { quill } = setupEditor()

    quill.setSelection(0, 1, 'api')

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
  })

  it('shows the badge on a silent selection change, like resize-quill-image uses to select an image', () => {
    const { quill } = setupEditor()

    quill.setSelection(0, 1, 'silent')

    const badge = quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')
    expect(badge?.style.display).toBe('flex')
  })

  it('does not show the badge for a caret right before or after the image', () => {
    const { quill } = setupEditor()
    const badgeDisplay = () => quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')?.style.display

    quill.setSelection(0, 0, 'api')
    expect(badgeDisplay()).not.toBe('flex')

    quill.setSelection(1, 0, 'api')
    expect(badgeDisplay()).not.toBe('flex')
  })

  it('does not show the badge for a caret next to an image that follows text', () => {
    const editorEl = document.createElement('div')
    document.body.appendChild(editorEl)
    const quill = new Quill(editorEl, { modules: { altText: true } })
    quill.setContents([{ insert: 'ab' }, { insert: { image: PIXEL_PNG } }, { insert: 'cd\n' }])
    const badgeDisplay = () => quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')?.style.display

    quill.setSelection(2, 0, 'api')
    expect(badgeDisplay()).not.toBe('flex')

    quill.setSelection(3, 0, 'api')
    expect(badgeDisplay()).not.toBe('flex')

    quill.setSelection(2, 1, 'api')
    expect(badgeDisplay()).toBe('flex')
  })

  it('hides the badge again when the selection collapses to a caret beside the image', () => {
    vi.useFakeTimers()
    try {
      const { quill } = setupEditor()
      const badgeDisplay = () => quill.root.parentElement?.querySelector<HTMLButtonElement>('.ql-alt-badge')?.style.display

      quill.setSelection(0, 1, 'api')
      expect(badgeDisplay()).toBe('flex')

      quill.setSelection(0, 0, 'api')
      vi.runAllTimers()
      expect(badgeDisplay()).not.toBe('flex')
    } finally {
      vi.useRealTimers()
    }
  })
})
