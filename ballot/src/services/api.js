const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('ballot_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('ballot_token', token);
  } else {
    localStorage.removeItem('ballot_token');
  }
};

export async function apiRequest(endpoint, method = 'GET', body = null, customToken = null) {
  const token = customToken || getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const authAPI = {
  register: (data) => apiRequest('/auth/register', 'POST', data),
  verifyEmail: (data) => apiRequest('/auth/verify-email', 'POST', data),
  login: (data) => apiRequest('/auth/login', 'POST', data),
  getMe: () => apiRequest('/auth/me', 'GET'),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', 'POST', data),
  resetPassword: (data) => apiRequest('/auth/reset-password', 'POST', data)
};

export const voterGroupAPI = {
  create: (data) => apiRequest('/voter-groups', 'POST', data),
  getAll: () => apiRequest('/voter-groups', 'GET'),
  getById: (id) => apiRequest(`/voter-groups/${id}`, 'GET'),
  update: (id, data) => apiRequest(`/voter-groups/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/voter-groups/${id}`, 'DELETE')
};

export const pollAPI = {
  create: (data) => apiRequest('/polls', 'POST', data),
  getAll: () => apiRequest('/polls', 'GET'),
  getById: (id) => apiRequest(`/polls/${id}`, 'GET'),
  update: (id, data) => apiRequest(`/polls/${id}`, 'PUT', data),
  publish: (id, data) => apiRequest(`/polls/${id}/publish`, 'POST', data),
  close: (id) => apiRequest(`/polls/${id}/close`, 'POST'),
  archive: (id) => apiRequest(`/polls/${id}/archive`, 'POST')
};

export const voterAPI = {
  getPollInfo: (code, token) => {
    const query = code ? `code=${encodeURIComponent(code)}` : `token=${encodeURIComponent(token)}`;
    return apiRequest(`/voter/poll-info?${query}`, 'GET');
  },
  checkEligibility: (data) => apiRequest('/voter/check-eligibility', 'POST', data),
  verifyOTP: (data) => apiRequest('/voter/verify-otp', 'POST', data),
  castVote: (data, voterToken) => apiRequest('/voter/cast-vote', 'POST', data, voterToken),
  getResults: (id) => apiRequest(`/voter/results/${id}`, 'GET')
};

export const adminAPI = {
  getUsers: (params = '') => apiRequest(`/admin/users${params}`, 'GET'),
  updateUserStatus: (id, status) => apiRequest(`/admin/users/${id}/status`, 'PATCH', { status }),
  getAllPolls: () => apiRequest('/admin/polls', 'GET'),
  closePollOverride: (id) => apiRequest(`/admin/polls/${id}/close-override`, 'POST'),
  getAuditLogs: (params = '') => apiRequest(`/admin/audit-logs${params}`, 'GET')
};
