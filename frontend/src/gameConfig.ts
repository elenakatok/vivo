import { type RoleConfig } from '@mygames/game-engine/roles'
import { type OutcomeField, type OutcomeSchema } from '@mygames/game-engine/outcome'

export type { RoleConfig, OutcomeField, OutcomeSchema }

export const vivoConfig: RoleConfig = {
  roles: [
    { key: 'vivo', label: 'Vivo', short: 'V' },
    { key: 'ads',  label: 'ADS',  short: 'A' },
  ],
}

// Mirrors functions/src/gameDefinition.ts. Keys P/DEV/OWN/C/SLA match scoring.
export const vivoSchema: OutcomeSchema = [
  { key: 'P',   type: 'decimal', min: 0, max: 1000 },                 // Payment Vivo→ADS ($M)
  { key: 'DEV', type: 'boolean' },                                    // Development
  { key: 'OWN', type: 'boolean' },                                    // Software Ownership
  { key: 'C',   type: 'enum', options: ['Escrow', 'Full', 'Neither'] }, // Source Code (required pick)
  { key: 'SLA', type: 'boolean' },                                    // Delivery SLA
  { key: 'notes', type: 'text' },                                     // optional free-text; blank = ''
]

export const FIELD_LABELS: Readonly<Record<string, string>> = {
  P:     'Payment ($M)',
  DEV:   'Development',
  OWN:   'Software ownership',
  C:     'Source code',
  SLA:   'Delivery SLA',
  notes: 'Notes',
}

export function formatField(field: OutcomeField, value: unknown): string {
  if (field.type === 'integer') return (value as number).toLocaleString('en-US')
  if (field.type === 'decimal') return (value as number).toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (field.type === 'enum')    return value as string
  if (field.type === 'boolean') return (value as boolean) ? 'Yes' : 'No'
  return String(value)
}
