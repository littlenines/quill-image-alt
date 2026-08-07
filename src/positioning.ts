export function toContainerOffset(
  target: HTMLElement,
  fallbackParent: HTMLElement,
  point: { x: number; y: number },
): { left: number; top: number } {
  const positionedParent = (target.offsetParent as HTMLElement | null) ?? fallbackParent
  const containerRect = positionedParent.getBoundingClientRect()
  
  return {
    left: point.x - containerRect.left + positionedParent.scrollLeft,
    top: point.y - containerRect.top + positionedParent.scrollTop,
  }
}
