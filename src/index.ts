import Quill, { Module, Parchment } from 'quill'
import { AltTextUIController } from './AltTextUIController'
import { DEFAULT_OPTIONS, resolvePosition, type AltTextOptions } from './constants'
import { injectStyles } from './injectStyles'

export type { AltTextOptions, BadgePosition } from './constants'

injectStyles()

const ImageBlot = Quill.import('formats/image') as new (...args: unknown[]) => Parchment.Blot

class AltText extends Module<AltTextOptions> {
  private uiController: AltTextUIController | null

  constructor(quill: Quill, options: AltTextOptions = {}) {
    super(quill, options)

    const merged = {
      ...DEFAULT_OPTIONS,
      ...options,
      position: resolvePosition(options.position),
      badgeStyles: { ...DEFAULT_OPTIONS.badgeStyles, ...options.badgeStyles },
      popoverStyles: { ...DEFAULT_OPTIONS.popoverStyles, ...options.popoverStyles },
    }

    const rootParent = quill.root.parentNode
    if (!(rootParent instanceof HTMLElement)) {
      throw new Error('AltText: quill.root has no parentNode')
    }

    this.uiController = new AltTextUIController(rootParent, merged)

    this.bindHandlers()
    this.addEventListeners()
  }

  private bindHandlers(): void {
    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleMouseOut = this.handleMouseOut.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.handleEditorChange = this.handleEditorChange.bind(this)
  }

  private addEventListeners(): void {
    this.quill.root.addEventListener('mouseover', this.handleMouseOver)
    this.quill.root.addEventListener('mouseout', this.handleMouseOut)
    this.quill.root.addEventListener('scroll', this.handleScroll, true)

    this.quill.on('editor-change', this.handleEditorChange)
  }

  private removeEventListeners(): void {
    this.quill.root.removeEventListener('mouseover', this.handleMouseOver)
    this.quill.root.removeEventListener('mouseout', this.handleMouseOut)
    this.quill.root.removeEventListener('scroll', this.handleScroll, true)

    this.quill.off('editor-change', this.handleEditorChange)
  }

  private handleMouseOver(event: MouseEvent): void {
    if (event.target instanceof HTMLImageElement && this.quill.root.contains(event.target)) {
      this.uiController?.notifyHover(event.target, true)
    }
  }

  private handleMouseOut(event: MouseEvent): void {
    if (event.target instanceof HTMLImageElement) {
      this.uiController?.notifyHover(event.target, false)
    }
  }

  private handleScroll(): void {
    this.uiController?.update()
  }

  private handleEditorChange(name: string, range: { index: number; length: number } | null): void {
    if (name === 'selection-change') {
      this.uiController?.notifySelection(range ? this.findImageAt(range.index) : null)
      return
    }

    if (name !== 'text-change') return

    const img = this.uiController?.img

    if (!img) return

    if (!this.quill.root.contains(img)) this.uiController?.notifyRemoved()
    else this.uiController?.update()
  }

  private findImageAt(index: number): HTMLImageElement | null {
    const [blot] = this.quill.scroll.descendant(ImageBlot, index)
    
    return blot?.domNode instanceof HTMLImageElement ? blot.domNode : null
  }

  destroy(): void {
    this.removeEventListeners()
    this.uiController?.destroy()
    this.uiController = null
  }
}

export default AltText
