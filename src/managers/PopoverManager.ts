import { IME_PROCESSING_KEY_CODE, KEY, POPOVER_OFFSET_Y, type ResolvedAltTextOptions } from '../constants'
import { toContainerOffset } from '../positioning'

export interface PopoverCallbacks {
  onSave: (value: string) => void
  onCancel: () => void
}

const SAVE_ICON =
  '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 4.5"/></svg>'

// The input box that appears under the badge to edit an image's alt text.
export class PopoverManager {
  private parent: HTMLElement
  private options: ResolvedAltTextOptions
  private callbacks: PopoverCallbacks
  element: HTMLDivElement | null = null
  private listeners: AbortController | null = null

  constructor(parent: HTMLElement, options: ResolvedAltTextOptions, callbacks: PopoverCallbacks) {
    this.parent = parent
    this.options = options
    this.callbacks = callbacks
  }

  create(initialValue: string, anchorEl: HTMLElement): void {
    const popover = document.createElement('div')
    popover.className = 'ql-alt-popover'
    Object.assign(popover.style, this.options.popoverStyles)

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'ql-alt-input'
    input.name = 'alt-text'
    input.setAttribute('aria-label', 'Alt text for image')
    input.placeholder = this.options.placeholder
    input.value = initialValue

    const row = document.createElement('div')
    row.className = 'ql-alt-row'

    const saveButton = document.createElement('button')
    saveButton.type = 'button'
    saveButton.className = 'ql-alt-save'
    saveButton.setAttribute('aria-label', 'Save alt text')
    saveButton.title = 'Save'
    saveButton.innerHTML = SAVE_ICON

    this.listeners = new AbortController()
    const { signal } = this.listeners

    popover.addEventListener(
      'keydown',
      (event) => {
        // Enter during IME composition confirms the composition, not the alt text.
        if (event.isComposing || event.keyCode === IME_PROCESSING_KEY_CODE) return

        if (event.key === KEY.ENTER && event.target === input) {
          event.preventDefault()
          this.callbacks.onSave(input.value)
        } else if (event.key === KEY.ESCAPE) {
          event.preventDefault()
          this.callbacks.onCancel()
        }
      },
      { signal },
    )

    popover.addEventListener('focusout', (event) => {
        if (event.relatedTarget instanceof Node && popover.contains(event.relatedTarget)) return
        this.callbacks.onSave(input.value)
      },
      { signal },
    )

    popover.addEventListener('mousedown', (event) => {
        if (event.target !== input) event.preventDefault()
      },
      { signal },
    )
    saveButton.addEventListener('click', () => this.callbacks.onSave(input.value), { signal })

    row.appendChild(input)
    row.appendChild(saveButton)

    const hint = document.createElement('span')

    hint.className = 'ql-alt-hint'
    hint.textContent = 'Enter to save · Esc to cancel'

    popover.appendChild(row)
    popover.appendChild(hint)
    
    this.parent.appendChild(popover)

    this.element = popover

    this.reposition(anchorEl)

    input.focus()
    input.select()
  }

  // Positions the popover just below wherever the badge currently sits
  reposition(anchorEl: HTMLElement): void {
    if (!this.element) return

    const anchorRect = anchorEl.getBoundingClientRect()
    const offset = toContainerOffset(this.element, this.parent, {
      x: anchorRect.left,
      y: anchorRect.bottom + POPOVER_OFFSET_Y,
    })

    Object.assign(this.element.style, { left: `${offset.left}px`, top: `${offset.top}px` })
  }

  remove(): void {
    const element = this.element
    this.element = null

    this.listeners?.abort()
    this.listeners = null

    element?.remove()
  }
}
