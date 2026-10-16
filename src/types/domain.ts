export interface AustralianMedicalContact {
  role: 'GP' | 'Specialist' | 'PersonalEmergency'
  name: string
  clinicOrRelationship?: string
  phone: string
}

export interface UserMedicalProfile {
  uid: string
  displayName: string
  dateOfBirth: string
  contacts: {
    gp: AustralianMedicalContact
    specialist: AustralianMedicalContact
    emergencyCarer: AustralianMedicalContact
  }
  carerWebhookUrl?: string
  customStrategies: string[]
  preferences: {
    audioChimesEnabled: boolean
    voiceGuidanceEnabled: boolean
    hapticsEnabled: boolean
    reducedMotion: boolean
    defaultBreathingPace: 'gentle_2_4' | 'standard_3_6' | 'relaxed_4_8'
  }
  updatedAt: string
}

export const DEFAULT_LFA_STRATEGIES = [
  { id: 'think-calm', category: 'Think', label: 'Think: Stay calm' },
  { id: 'think-go-away', category: 'Think', label: 'Think: "I know it will go away"' },
  { id: 'think-doing-now', category: 'Think', label: 'Think: "I am doing it now"' },
  { id: 'pos-flop-drop', category: 'Position', label: 'Position: Flop and drop shoulders' },
  { id: 'pos-lean-forward', category: 'Position', label: 'Position: Lean forward' },
  { id: 'breathe-pursed', category: 'Breathe', label: 'Breathe: Pursed lip breathing' },
  { id: 'breathe-rectangle', category: 'Breathe', label: 'Breathe: Breathing around the rectangle' },
  { id: 'air-fan', category: 'Airflow', label: 'Airflow: Use a handheld fan' },
  { id: 'air-cloth', category: 'Airflow', label: 'Airflow: Wipe a damp cloth on face' },
] as const

export type EpisodeTrigger =
  | 'Activity / Exertion'
  | 'Weather / Temperature'
  | 'Emotions / Anxiety'
  | 'Medical Flare-up / Infection'
  | 'Air Quality / Irritants'
  | 'Unknown'

export interface BreathlessnessEpisodeRecord {
  id: string
  uid: string
  occurredAt: string
  durationMinutes: number
  severityRating: number
  triggers: EpisodeTrigger[]
  strategiesUsed: string[]
  mostEffectiveStrategy: string
  pathwayTaken: 'GREEN_RECOVERY' | 'RED_ESCALATION'
  notes: string
}

export interface RedPathWebhookPayload {
  event: 'COPD_RED_PATH_ESCALATION'
  patientName: string
  triggeredAtAEST: string
  carerName: string
  carerPhone: string
  strategiesAttempted: string[]
  elapsedCrisisMinutes: number
  escalationTarget: '000' | 'GP' | 'Specialist' | 'Carer'
}
