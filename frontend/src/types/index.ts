export type Role = 'officer' | 'startup' | 'evaluator';

// ── Auth types ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  name: string;
  role: Role;
  email: string;
  created_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'startup' | 'gov_officer';
}



export interface User {
  id: number;
  name: string;
  role: Role;
  email: string;
}

export interface Startup {
  id: number;
  user_id: number;
  name: string;
  sector: string;
  dpiit_status: boolean;
  profile_text: string;
}

export interface Challenge {
  id: number;
  officer_id: number;
  title: string;
  description: string;
  outcomes: string;
  constraints: string;
  budget_band: string;
  required_sector: string;
  dpiit_required: boolean;
  status: 'draft' | 'published' | 'closed';
}

export interface Evaluation {
  id: number;
  application_id: number;
  evaluator_id: number;
  score: number;
  notes: string;
}

export interface Application {
  id: number;
  startup_id: number;
  challenge_id: number;
  proposal_text: string;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'rejected';
  startup?: Startup;
  evaluation?: Evaluation;
}

export interface KPI {
  id: number;
  pilot_id: number;
  name: string;
  target_value: number;
  unit: string;
}

export interface Evidence {
  id: number;
  pilot_id: number;
  kpi_id: number;
  submitted_value: number;
  description: string;
  submitted_date: string;
  status: 'pending' | 'approved' | 'rejected';
  file_ref?: string | null;
}

export interface Decision {
  id: number;
  pilot_id: number;
  recommendation: string;
  notes: string;
}

export interface Pilot {
  id: number;
  application_id: number;
  scope: string;
  timeline_start: string;
  timeline_end: string;
  status: 'planned' | 'active' | 'completed' | 'extended' | 'discontinued';
  kpis?: KPI[];
  decision?: Decision | null;
  application?: Application;
}

export interface DecisionSupport {
  pilot_id: number;
  total_kpis: number;
  approved_kpis: number;
  achievement_ratio: number;
  recommendation: 'Recommend Scale' | 'Extend Pilot' | 'Discontinue' | 'Insufficient Data';
  explanation: string;
}

export interface EligibilityResult {
  sector_match: boolean;
  dpiit_match: boolean;
  overall_aligned: boolean;
  sector_message: string;
  dpiit_message: string;
  guidance: string;
}
