import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS, resolvePosition } from '../src/constants'

describe('resolvePosition', () => {
  it('passes through a valid position', () => {
    expect(resolvePosition('bottom-right')).toBe('bottom-right')
  })

  it('falls back to the default when given an invalid value', () => {
    expect(resolvePosition('center')).toBe(DEFAULT_OPTIONS.position)
  })

  it('falls back to the default when undefined', () => {
    expect(resolvePosition(undefined)).toBe(DEFAULT_OPTIONS.position)
  })
})
