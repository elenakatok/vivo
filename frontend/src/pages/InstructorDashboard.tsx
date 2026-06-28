import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { InstructorDashboard as SharedDashboard, type DeadlockResolutionProps, type OutcomeFields } from '@mygames/game-ui'
import { auth, functions, rtdb } from '../firebase'
import { vivoConfig } from '../gameConfig'

// ── Role labels from game config ──────────────────────────────────────────────

const roleLabels = Object.fromEntries(
  vivoConfig.roles.map(r => [r.key, r.label])
)

// ── Deadlock resolution control ───────────────────────────────────────────────

const CODE_OPTIONS = ['Escrow', 'Full', 'Neither'] as const

function VivoDeadlockControl({ submitting, error, onSubmit }: DeadlockResolutionProps) {
  const [payment, setPayment] = useState('')
  const [dev,     setDev]     = useState(false)
  const [own,     setOwn]     = useState(false)
  const [code,    setCode]    = useState<string>('')   // no default — required pick
  const [sla,     setSla]     = useState(false)
  const [noDeal,  setNoDeal]  = useState(false)

  const handleSubmit = () => {
    if (noDeal) { onSubmit({ no_deal: true }); return }
    const P = Number(payment)
    if (payment === '' || isNaN(P) || !isFinite(P)) return
    if (!CODE_OPTIONS.includes(code as typeof CODE_OPTIONS[number])) return
    const outcome: OutcomeFields = { P, DEV: dev, OWN: own, C: code, SLA: sla, notes: '' }
    onSubmit(outcome)
  }

  const inputStyle: React.CSSProperties = {
    fontSize: '0.875rem', padding: '0.3rem 0.5rem', borderRadius: 3, border: '1px solid #ccc',
  }
  const fieldStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {!noDeal && (
        <>
          <div style={fieldStyle}>
            <label style={{ fontSize: '0.875rem', minWidth: '7rem' }}>Payment ($M)</label>
            <input type="number" step="any" placeholder="e.g. 40" value={payment}
              onChange={e => setPayment(e.target.value)} style={{ ...inputStyle, width: '9rem' }} disabled={submitting} />
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: '0.875rem', minWidth: '7rem' }}>Development</label>
            <input type="checkbox" checked={dev} onChange={e => setDev(e.target.checked)} disabled={submitting} />
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: '0.875rem', minWidth: '7rem' }}>Ownership</label>
            <input type="checkbox" checked={own} onChange={e => setOwn(e.target.checked)} disabled={submitting} />
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: '0.875rem', minWidth: '7rem' }}>Source code</label>
            <select value={code} onChange={e => setCode(e.target.value)} style={inputStyle} disabled={submitting}>
              <option value="" disabled>— select —</option>
              {CODE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={{ fontSize: '0.875rem', minWidth: '7rem' }}>Delivery SLA</label>
            <input type="checkbox" checked={sla} onChange={e => setSla(e.target.checked)} disabled={submitting} />
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
        <button onClick={handleSubmit} disabled={submitting || (!noDeal && (!payment || !code))}>
          {submitting ? '…' : noDeal ? 'Confirm No Deal' : 'Lock Deal'}
        </button>
        <button onClick={() => setNoDeal(v => !v)} disabled={submitting} style={{ background: 'none', border: '1px solid #ccc' }}>
          {noDeal ? 'Enter deal terms instead' : 'No deal'}
        </button>
      </div>
      {error && <p style={{ color: '#c00', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ── Submit instructor outcome ─────────────────────────────────────────────────

async function submitInstructorOutcome(groupId: string, outcome: OutcomeFields): Promise<void> {
  const fn = httpsCallable(functions, 'submitInstructorOutcome')
  await fn({ group_id: groupId, outcome })
}

// ── Page component ────────────────────────────────────────────────────────────

export default function InstructorDashboard() {
  return (
    <SharedDashboard
      title="Instructor Dashboard — Vivo"
      roleLabels={roleLabels}
      DeadlockResolutionControl={VivoDeadlockControl}
      submitInstructorOutcome={submitInstructorOutcome}
      functions={functions}
      auth={auth}
      rtdb={rtdb}
      settingsRoute="/settings"
      reportsRoute="/reports"
    />
  )
}
