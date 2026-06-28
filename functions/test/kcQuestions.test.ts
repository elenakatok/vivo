import { describe, it, expect } from 'vitest'
import { validateQuestionSemantics, validateKCGate, parsePrepTextQuestions } from '@mygames/game-server'
import { vivoGameDef } from '../src/gameDefinition'

const ROLES = vivoGameDef.roles.roles.map(r => r.key)
const questions = vivoGameDef.prepDefaults!

describe('Vivo prepDefaults — structural integrity', () => {
  it('parses as valid PrepTextQuestion[] (no type/field errors)', () => {
    expect(parsePrepTextQuestions(questions)).not.toBeNull()
  })

  it('passes validateQuestionSemantics', () => {
    expect(validateQuestionSemantics(questions)).toBeNull()
  })

  it('passes validateKCGate for both roles', () => {
    expect(validateKCGate(ROLES, questions)).toBeNull()
  })

  it('has no duplicate field names', () => {
    const fields = questions.map(q => q.field)
    expect(new Set(fields).size).toBe(fields.length)
  })
})

describe('Vivo prepDefaults — per-role question counts (asymmetric)', () => {
  it('vivo: 1 gate + 2 graded MC + 3 reflection = 6 visible', () => {
    const v = questions.filter(q => q.role_target === 'vivo' || q.role_target === 'all')
    expect(v).toHaveLength(6)
    expect(v.filter(q => q.grading === 'assigned_role' && q.system)).toHaveLength(1)
    expect(v.filter(q => q.grading === 'static' && q.category === 'knowledge_check')).toHaveLength(2)
    expect(v.filter(q => q.category === 'preparation')).toHaveLength(3)
  })

  it('ads: 1 gate + 5 graded MC + 1 reflection = 7 visible', () => {
    const a = questions.filter(q => q.role_target === 'ads' || q.role_target === 'all')
    expect(a).toHaveLength(7)
    expect(a.filter(q => q.grading === 'assigned_role' && q.system)).toHaveLength(1)
    expect(a.filter(q => q.grading === 'static' && q.category === 'knowledge_check')).toHaveLength(5)
    expect(a.filter(q => q.category === 'preparation')).toHaveLength(1)
  })
})

describe('Vivo prepDefaults — graded MC flags', () => {
  const graded = questions.filter(q => q.grading === 'static')

  it('all graded questions are system:false and deletable:false', () => {
    for (const q of graded) { expect(q.system).toBe(false); expect(q.deletable).toBe(false) }
  })

  it('all graded questions have correct_value matching one of their options', () => {
    for (const q of graded) {
      const vals = (q.options ?? []).map(o => o.value)
      expect(vals).toContain(q.correct_value)
    }
  })

  it('all graded questions have explanation text', () => {
    for (const q of graded) {
      expect(typeof q.explanation).toBe('string')
      expect(q.explanation!.length).toBeGreaterThan(0)
    }
  })

  it('no explanation references a positional label (shuffle-safe)', () => {
    const positional = /\b(option [abcde]|choice [abcde]|answer [abcde]|\(a\)|\(b\)|\(c\)|\(d\)|\(e\)|first option|second option|third option|fourth option|fifth option|sixth option)\b/i
    for (const q of graded) {
      if (q.explanation) expect(q.explanation).not.toMatch(positional)
    }
  })
})

describe('Vivo prepDefaults — gate + reflection flags', () => {
  const gates = questions.filter(q => q.grading === 'assigned_role')
  const reflect = questions.filter(q => q.category === 'preparation')

  it('gate questions are system:true, deletable:false, no correct_value, options vivo+ads', () => {
    for (const g of gates) {
      expect(g.system).toBe(true)
      expect(g.deletable).toBe(false)
      expect(g.correct_value).toBeUndefined()
      const vals = (g.options ?? []).map(o => o.value)
      expect(vals).toContain('vivo')
      expect(vals).toContain('ads')
    }
  })

  it('reflection questions are text, deletable, ungraded', () => {
    for (const q of reflect) {
      expect(q.format).toBe('text')
      expect(q.deletable).toBe(true)
      expect(q.grading).toBeUndefined()
      expect(q.correct_value).toBeUndefined()
    }
  })
})
