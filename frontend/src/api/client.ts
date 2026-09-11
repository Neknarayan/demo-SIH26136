import type {
  User,
  AuthUser,
  TokenResponse,
  LoginPayload,
  RegisterPayload,
  Startup,
  Challenge,
  Application,
  Evaluation,
  Pilot,
  KPI,
  Evidence,
  Decision,
  DecisionSupport,
  EligibilityResult
} from '../types';

const API_BASE = 'http://127.0.0.1:8000';

class ApiClient {
  private currentUserId: number | null = null;
  private jwtToken: string | null = localStorage.getItem('sih_jwt_token');

  // ── JWT token management ────────────────────────────────────────────────────
  setToken(token: string | null) {
    this.jwtToken = token;
    if (token) {
      localStorage.setItem('sih_jwt_token', token);
    } else {
      localStorage.removeItem('sih_jwt_token');
    }
  }

  getToken(): string | null {
    return this.jwtToken;
  }

  setUserId(id: number | null) {
    this.currentUserId = id;
    if (id) {
      localStorage.setItem('sih_demo_user_id', String(id));
    } else {
      localStorage.removeItem('sih_demo_user_id');
    }
  }

  getSavedUserId(): number | null {
    const saved = localStorage.getItem('sih_demo_user_id');
    return saved ? parseInt(saved, 10) : null;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.currentUserId) {
      headers['X-User-Id'] = String(this.currentUserId);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ');
          } else {
            errorMessage = errorData.detail;
          }
        }
      } catch {
        // Fallback to generic statusText
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ── Auth endpoints ──────────────────────────────────────────────────────────
  async authRegister(payload: RegisterPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail || 'Registration failed');
    }
    return res.json() as Promise<TokenResponse>;
  }

  async authLogin(payload: LoginPayload): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail || 'Login failed');
    }
    return res.json() as Promise<TokenResponse>;
  }

  async authMe(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json() as Promise<AuthUser>;
  }

  // Users
  getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }


  // Challenges
  getChallenges(): Promise<Challenge[]> {
    return this.request<Challenge[]>('/challenges');
  }

  getChallenge(id: number): Promise<Challenge> {
    return this.request<Challenge>(`/challenges/${id}`);
  }

  createChallenge(data: Omit<Challenge, 'id' | 'officer_id'>): Promise<Challenge> {
    return this.request<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Startups & Eligibility
  getMyStartup(): Promise<Startup> {
    return this.request<Startup>('/startups/me');
  }

  getStartup(id: number): Promise<Startup> {
    return this.request<Startup>(`/startups/${id}`);
  }

  getInformationalEligibility(challengeId: number): Promise<EligibilityResult> {
    return this.request<EligibilityResult>(`/startups/eligibility/${challengeId}`);
  }

  // Applications
  getApplications(challengeId?: number, startupId?: number): Promise<Application[]> {
    const params = new URLSearchParams();
    if (challengeId) params.append('challenge_id', String(challengeId));
    if (startupId) params.append('startup_id', String(startupId));
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Application[]>(`/applications${qs}`);
  }

  createApplication(challengeId: number, proposalText: string): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({
        challenge_id: challengeId,
        proposal_text: proposalText,
      }),
    });
  }

  updateApplicationStatus(applicationId: number, status: string): Promise<Application> {
    return this.request<Application>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Evaluations
  createEvaluation(applicationId: number, score: number, notes: string): Promise<Evaluation> {
    return this.request<Evaluation>('/evaluations', {
      method: 'POST',
      body: JSON.stringify({
        application_id: applicationId,
        score,
        notes,
      }),
    });
  }

  // Pilots
  getPilots(): Promise<Pilot[]> {
    return this.request<Pilot[]>('/pilots');
  }

  getPilot(id: number): Promise<Pilot> {
    return this.request<Pilot>(`/pilots/${id}`);
  }

  createPilot(data: {
    application_id: number;
    scope: string;
    timeline_start: string;
    timeline_end: string;
  }): Promise<Pilot> {
    return this.request<Pilot>('/pilots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // KPIs
  getPilotKpis(pilotId: number): Promise<KPI[]> {
    return this.request<KPI[]>(`/pilots/${pilotId}/kpis`);
  }

  createKpi(pilotId: number, data: { name: string; target_value: number; unit: string }): Promise<KPI> {
    return this.request<KPI>(`/pilots/${pilotId}/kpis`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Evidence
  getPilotEvidence(pilotId: number): Promise<Evidence[]> {
    return this.request<Evidence[]>(`/pilots/${pilotId}/evidence`);
  }

  submitEvidence(kpiId: number, data: { submitted_value: number; description: string; file_ref?: string }): Promise<Evidence> {
    return this.request<Evidence>(`/kpis/${kpiId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateEvidenceStatus(evidenceId: number, status: 'approved' | 'rejected'): Promise<Evidence> {
    return this.request<Evidence>(`/evidence/${evidenceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Decision Support & Decisions
  getDecisionSupport(pilotId: number): Promise<DecisionSupport> {
    return this.request<DecisionSupport>(`/pilots/${pilotId}/decision-support`);
  }

  recordDecision(pilotId: number, recommendation: string, notes: string): Promise<Decision> {
    return this.request<Decision>(`/pilots/${pilotId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ recommendation, notes }),
    });
  }
}

export const api = new ApiClient();
