const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')
const API_CONNECTION_ERROR = 'Não foi possível conectar à API. Confirme se o backend está ativo, se VITE_API_URL usa o IP do computador (não localhost) e se a rede Wi-Fi e o CORS permitem a conexão.'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function fetchApi(url, options) {
  try {
    return await fetch(url, options)
  } catch (issue) {
    if (issue instanceof TypeError) {
      throw new ApiError(API_CONNECTION_ERROR, 0)
    }
    throw issue
  }
}

async function request(path, { method = 'GET', body, authenticated = true, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const token = sessionStorage.getItem('nexora_access_token')
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetchApi(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 401 && authenticated) {
    sessionStorage.removeItem('nexora_access_token')
    window.dispatchEvent(new Event('nexora:unauthorized'))
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    throw new ApiError(data?.message || data?.error || `Falha na solicitação (${response.status}).`, response.status, data)
  }
  return data
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials, authenticated: false }),
  register: (details) => request('/auth/register', { method: 'POST', body: details, authenticated: false }),
  me: () => request('/auth/me'),
  dashboard: () => request('/dashboard'),
  publications: (filters = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
    return request(`/publications${query.size ? `?${query}` : ''}`)
  },
  campaigns: () => request('/campaigns'),
  createCampaign: (data) => request('/campaigns', { method: 'POST', body: data }),
  updateCampaign: (id, data) => request(`/campaigns/${id}`, { method: 'PUT', body: data }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  campaignPublications: (id) => request(`/campaigns/${id}/publications`),
  createPublication: (campaignId, data) => request(`/campaigns/${campaignId}/publications`, { method: 'POST', body: data }),
  updatePublication: (id, data) => request(`/publications/${id}`, { method: 'PUT', body: data }),
  deletePublication: (id) => request(`/publications/${id}`, { method: 'DELETE' }),
  updateMetrics: (id, data) => request(`/publications/${id}/metrics`, { method: 'PUT', body: data }),
  updateConversions: (id, data) => request(`/publications/${id}/conversions`, { method: 'PUT', body: data }),
  conversion: () => request('/analysis/conversion'),
  breakdown: (by) => request(`/analysis/breakdown?by=${encodeURIComponent(by)}`),
  recommendations: () => request('/recommendations'),
  assistantChat: (message) => request('/assistant/chat', { method: 'POST', body: { message } }),
  async downloadCsv() {
    const token = sessionStorage.getItem('nexora_access_token')
    const response = await fetchApi(`${API_URL}/reports/publications.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (response.status === 401) {
      sessionStorage.removeItem('nexora_access_token')
      window.dispatchEvent(new Event('nexora:unauthorized'))
    }
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      const error = contentType.includes('application/json') ? await response.json() : null
      throw new ApiError(error?.message || error?.error || `Falha ao exportar (${response.status}).`, response.status, error)
    }
    return response.blob()
  },
}
