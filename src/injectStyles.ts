import { CSS } from './css'

const STYLE_ELEMENT_ID = 'quill-image-alt-styles'

export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ELEMENT_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
