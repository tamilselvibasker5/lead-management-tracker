/**
 * Centralized API module connected to MongoDB Atlas via Express backend.
 */

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  '/api';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json();
      throw new Error(data.error || 'API Request failed');
    }
    throw new Error(`Server returned HTTP ${res.status}`);
  }
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  throw new Error('Invalid server response format (expected JSON)');
}

/* ──────────────────────────── AUTH ──────────────────────────── */

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  return { user: data.user, token: `token_${data.user.id}` };
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  return await handleResponse(res);
}

/* ──────────────────────────── LEADS ──────────────────────────── */

export async function fetchLeads(filters = {}) {
  const params = new URLSearchParams();
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/leads${query}`);
  return await handleResponse(res);
}

export async function updateLeadStatus(leadId, newStatus) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  return await handleResponse(res);
}

export async function updateLeadDetails(leadId, updates) {
  const res = await fetch(`${API_BASE}/leads/${leadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return await handleResponse(res);
}

export async function assignLead(leadId, employeeId) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/assign`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  return await handleResponse(res);
}

export async function swapLead(leadId, targetEmployeeId, targetEmployeeName, reason, currentUserId, currentUserName) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEmployeeId, targetEmployeeName, reason, currentUserId, currentUserName }),
  });
  return await handleResponse(res);
}

export async function deleteLead(leadId) {
  const res = await fetch(`${API_BASE}/leads/${leadId}`, {
    method: 'DELETE',
  });
  return await handleResponse(res);
}

export async function deleteAllLeads() {
  const res = await fetch(`${API_BASE}/leads/all`, {
    method: 'DELETE',
  });
  return await handleResponse(res);
}

export async function addLead(leadData) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  return await handleResponse(res);
}

export async function bulkImportLeads(importedLeads, creatorId = null, creatorRole = null) {
  const res = await fetch(`${API_BASE}/leads/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leads: importedLeads, creatorId, creatorRole }),
  });
  const data = await handleResponse(res);
  return data.leads;
}

export async function addLeadActivity(leadId, activity) {
  const res = await fetch(`${API_BASE}/leads/${leadId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity),
  });
  return await handleResponse(res);
}

/* ──────────────────────────── NOTIFICATIONS ──────────────────────────── */

export async function fetchNotifications(userId, role) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/notifications${query}`);
    if (res.status === 404) {
      return [];
    }
    return await handleResponse(res);
  } catch (_err) {
    return [];
  }
}

export async function markNotificationAsRead(id, userId) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  return await handleResponse(res);
}

export async function markAllNotificationsAsRead(userId, role) {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
  return await handleResponse(res);
}

export async function clearNotifications(userId, role) {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  if (role) params.append('role', role);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/notifications/clear${query}`, {
    method: 'DELETE',
  });
  return await handleResponse(res);
}

/* ──────────────────────────── EMPLOYEES ──────────────────────────── */

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/employees`);
  return await handleResponse(res);
}

export async function addEmployee(data) {
  const res = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await handleResponse(res);
}

export async function updateEmployee(employeeId, updatedData) {
  const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  return await handleResponse(res);
}

export async function deleteEmployee(employeeId) {
  const res = await fetch(`${API_BASE}/employees/${employeeId}`, {
    method: 'DELETE',
  });
  return await handleResponse(res);
}

import { mockProducts } from '../mocks/products';

/* ──────────────────────────── PRODUCTS ──────────────────────────── */

export async function fetchProducts(filters = {}) {
  let data = [...mockProducts];
  if (filters.category && filters.category !== 'all') {
    data = data.filter((p) => p.category === filters.category);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    data = data.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }
  return data;
}
