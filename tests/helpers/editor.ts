import Quill from 'quill'
import AltText from '../../src'

Quill.register('modules/altText', AltText)

export const PIXEL_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

export function setupEditor() {
  const editorEl = document.createElement('div')
  document.body.appendChild(editorEl)
  const quill = new Quill(editorEl, { modules: { altText: true } })
  quill.setContents([{ insert: { image: PIXEL_PNG } }, { insert: '\n' }])
  const img = quill.root.querySelector('img')
  if (!img) throw new Error('image not inserted')
  return { quill, img }
}
