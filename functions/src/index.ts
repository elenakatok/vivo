import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import {
  makeGetInstructorSession,
  makeAssignRole,
  makeCompletePrep,
  makeConfirmReady,
  makeGenerateAttendanceCode,
  makeVerifyAttendanceCode,
  makeGetRoster,
  makeSyncRoster,
  makeTriggerMatching,
  makeStartNegotiation,
  makeSubmitLeadOutcome,
  makeSubmitConfirmation,
  makeSubmitInstructorOutcome,
  makeFinalizeInstance,
  makePushResultsToClassroom,
  makeGetGameConfig,
  makeUpdateGameConfig,
  validateKCGate,
  makeGetStudentPrepQuestions,
  makeGetDebriefQuestions,
  makeSubmitKnowledgeCheck,
  makeSubmitStaticKnowledgeCheckQuestion,
  makeGetInfoUrls,
} from '@mygames/game-server'
import { vivoGameDef } from './gameDefinition'

admin.initializeApp()

// ── KC gate validation (cold-start; loud failure if gate is misconfigured) ────
const _kcGateError = validateKCGate(
  vivoGameDef.roles.roles.map(r => r.key),
  vivoGameDef.prepDefaults ?? [],
)
if (_kcGateError) throw new Error(`Vivo KC gate validation failed: ${_kcGateError}`)

// ── Game endpoints (onCall, via game-server factories + Vivo definition) ──────

export const getInstructorSession  = makeGetInstructorSession(vivoGameDef)
export const assignRole             = makeAssignRole(vivoGameDef)
export const completePrep           = makeCompletePrep(vivoGameDef)
export const confirmReady           = makeConfirmReady(vivoGameDef)
export const generateAttendanceCode = makeGenerateAttendanceCode(vivoGameDef)
export const verifyAttendanceCode   = makeVerifyAttendanceCode(vivoGameDef)
export const getRoster              = makeGetRoster(vivoGameDef)
export const syncRoster             = makeSyncRoster(vivoGameDef)
export const triggerMatching            = makeTriggerMatching(vivoGameDef)
export const startNegotiation           = makeStartNegotiation(vivoGameDef)
export const submitLeadOutcome          = makeSubmitLeadOutcome(vivoGameDef)
export const submitConfirmation         = makeSubmitConfirmation(vivoGameDef)
export const submitInstructorOutcome    = makeSubmitInstructorOutcome(vivoGameDef)
export const finalizeInstance       = makeFinalizeInstance(vivoGameDef)
export const pushResultsToClassroom = makePushResultsToClassroom(vivoGameDef)
export const getGameConfig          = makeGetGameConfig(vivoGameDef)
export const updateGameConfig       = makeUpdateGameConfig(vivoGameDef)
export const getStudentPrepQuestions            = makeGetStudentPrepQuestions(vivoGameDef)
export const getDebriefQuestions                = makeGetDebriefQuestions(vivoGameDef)
export const submitKnowledgeCheck               = makeSubmitKnowledgeCheck(vivoGameDef)
export const submitStaticKnowledgeCheckQuestion = makeSubmitStaticKnowledgeCheckQuestion(vivoGameDef)
export const getInfoUrls                        = makeGetInfoUrls(vivoGameDef)
export { getReportData } from './getReportData'
export { updateGroupContract } from './updateGroupContract'

// ── Non-game onRequest endpoints ──────────────────────────────────────────────

const CORS_ORIGINS = new Set(['https://vivo.mygames.live'])

export const health = onRequest((req, res) => {
  const origin = req.headers.origin ?? ''
  if (CORS_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.set('Vary', 'Origin')
  }
  if (req.method === 'OPTIONS') { res.status(204).send(''); return }
  res.json({ ok: true, game: 'vivo' })
})

// Emulator-only dev seed functions.
export { seedMatchTest, seedGroupForTest } from './seedFunctions'
