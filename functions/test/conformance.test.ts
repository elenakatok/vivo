import { describe, it, expect } from 'vitest'
import { computeRawScore, CONFORMANCE_VECTOR } from '../src/gameDefinition'

describe('Vivo scoring conformance', () => {
  for (const c of CONFORMANCE_VECTOR) {
    it(c.label, () => {
      expect(computeRawScore('ads',  c.outcome)).toBe(c.expectedADS)
      expect(computeRawScore('vivo', c.outcome)).toBe(c.expectedVivo)
    })
  }

  it('walk-away: null outcome → 0 for both roles (took BATNA, zero surplus)', () => {
    expect(computeRawScore('ads',  null)).toBe(0)
    expect(computeRawScore('vivo', null)).toBe(0)
  })
})
