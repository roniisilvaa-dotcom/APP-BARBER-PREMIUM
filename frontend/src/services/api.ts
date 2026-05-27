/**
 * BarberPro Premium — API Service
 * Connects the frontend to the backend REST API
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-roni-silva.vercel.app'

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('bp_auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  nome: string
  email: string
  role: string
  barbearia_id: string | null
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export const authApi = {
  login: (email: string, senha: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  registro: (data: {
    nome: string
    email: string
    senha: string
    nome_barbearia?: string
    role?: string
  }) =>
    request<AuthResponse>('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>('/api/auth/me'),
}

// ─── Barbeiros ────────────────────────────────────────────────────────────────

export interface BarbeiroDB {
  id: string
  barbearia_id: string
  nome: string
  foto_url: string | null
  bio: string | null
  telefone: string | null
  rating: number
  comissao_percentual: number
  especialidades: string[]
  ativo: boolean
}

export const barbeirosApi = {
  list: () => request<BarbeiroDB[]>('/api/barbeiros'),
  create: (data: Partial<BarbeiroDB>) =>
    request<BarbeiroDB>('/api/barbeiros', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BarbeiroDB>) =>
    request<BarbeiroDB>(`/api/barbeiros/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

export interface ClienteDB {
  id: string
  barbearia_id: string
  nome: string
  telefone: string
  whatsapp: string | null
  email: string | null
  data_nascimento: string | null
  notas: string | null
  total_visitas: number
  total_gasto: number
  pontos_fidelidade: number
  ultima_visita: string | null
  ativo: boolean
  criado_em: string
}

export const clientesApi = {
  list: (busca?: string) =>
    request<ClienteDB[]>(`/api/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
  create: (data: Partial<ClienteDB>) =>
    request<ClienteDB>('/api/clientes', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Agendamentos ─────────────────────────────────────────────────────────────

export interface AgendamentoDB {
  id: string
  barbearia_id: string
  filial_id: string | null
  cliente_id: string | null
  barbeiro_id: string
  servico_id: string
  data: string
  hora: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  preco_pago: number
  forma_pagamento: string | null
  notas: string | null
  origem: string
  // Joined fields
  cliente_nome?: string
  cliente_tel?: string
  barbeiro_nome?: string
  servico_nome?: string
  duracao_minutos?: number
}

export const agendamentosApi = {
  list: (filters?: { data?: string; barbeiro_id?: string; filial_id?: string; status?: string }) => {
    const params = new URLSearchParams()
    if (filters?.data) params.set('data', filters.data)
    if (filters?.barbeiro_id) params.set('barbeiro_id', filters.barbeiro_id)
    if (filters?.filial_id) params.set('filial_id', filters.filial_id)
    if (filters?.status) params.set('status', filters.status)
    const qs = params.toString()
    return request<AgendamentoDB[]>(`/api/agendamentos${qs ? `?${qs}` : ''}`)
  },
  create: (data: Partial<AgendamentoDB>) =>
    request<AgendamentoDB>('/api/agendamentos', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    request<AgendamentoDB>(`/api/agendamentos/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

// ─── Serviços ─────────────────────────────────────────────────────────────────

export interface ServicoDB {
  id: string
  barbearia_id: string
  categoria_id: string | null
  nome: string
  descricao: string | null
  preco: number
  duracao_minutos: number
  ativo: boolean
}

export const servicosApi = {
  list: () => request<ServicoDB[]>('/api/servicos'),
  create: (data: Partial<ServicoDB>) =>
    request<ServicoDB>('/api/servicos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ServicoDB>) =>
    request<ServicoDB>(`/api/servicos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── Financeiro ───────────────────────────────────────────────────────────────

export interface LancamentoDB {
  id: string
  barbearia_id: string
  filial_id: string | null
  agendamento_id: string | null
  barbeiro_id: string | null
  tipo: 'receita' | 'despesa'
  categoria: string
  descricao: string
  valor: number
  comissao_valor: number
  forma_pagamento: string | null
  data: string
  barbeiro_nome?: string
}

export interface ResumoFinanceiro {
  receita: number
  despesa: number
  lucro: number
  total_comissoes: number
}

export const financeiroApi = {
  list: (inicio?: string, fim?: string) => {
    const params = new URLSearchParams()
    if (inicio) params.set('inicio', inicio)
    if (fim) params.set('fim', fim)
    const qs = params.toString()
    return request<LancamentoDB[]>(`/api/financeiro${qs ? `?${qs}` : ''}`)
  },
  resumo: (inicio?: string, fim?: string) => {
    const params = new URLSearchParams()
    if (inicio) params.set('inicio', inicio)
    if (fim) params.set('fim', fim)
    const qs = params.toString()
    return request<ResumoFinanceiro>(`/api/financeiro/resumo${qs ? `?${qs}` : ''}`)
  },
  create: (data: Partial<LancamentoDB>) =>
    request<LancamentoDB>('/api/financeiro', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Barbearia ────────────────────────────────────────────────────────────────

export interface BarbeariaDB {
  id: string
  nome: string
  slug: string
  descricao: string | null
  telefone: string | null
  whatsapp: string | null
  email: string | null
  logo_url: string | null
  plano: 'starter' | 'premium' | 'franquia'
  ativo: boolean
}

export const barbeariasApi = {
  get: (id: string) => request<BarbeariaDB>(`/api/barbearias/${id}`),
  update: (id: string, data: Partial<BarbeariaDB>) =>
    request<BarbeariaDB>(`/api/barbearias/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
}

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  localStorage.setItem('bp_auth_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('bp_auth_token')
}

export function getToken(): string | null {
  return localStorage.getItem('bp_auth_token')
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
