/**
 * Centralized API module.
 *
 * 🔌 API INTEGRATION POINT
 * ─────────────────────────
 * Every function below currently returns MOCK data so you can build and test
 * the UI without a backend. When your backend is ready, replace each mock
 * implementation with a real fetch/axios call.
 *
 * Steps to integrate:
 *   1. Set BASE_URL to your backend root (e.g. 'https://api.yourdomain.com')
 *   2. Replace the mock body of each function with a real HTTP request.
 *   3. Ensure your backend returns JSON in the shapes described by the JSDoc
 *      comments on each function.
 */

import mockUsers from '../mocks/users';
import mockLeadsData from '../mocks/leads';
import mockEmployeesData from '../mocks/employees';

// 🔌 TODO: Replace with your backend URL
const BASE_URL = '';

/* ────── Simulated network delay (remove when using real API) ────── */
const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

/* ══════════════════════════════════════════════════════════════════
   In-memory copies of mock data so mutations persist during a session.
   Remove these once you have a real backend.
   ══════════════════════════════════════════════════════════════════ */
let leads = [...mockLeadsData];
let employees = [...mockEmployeesData];

/* ──────────────────────────── AUTH ──────────────────────────── */

/**
 * Authenticate a user.
 * 🔌 API INTEGRATION POINT — POST /api/auth/login
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function login(email, password) {
  await delay(600);

  // Mock: find matching user
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Strip password before returning
  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: `mock_token_${user.id}` };

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json(); // expected: { user, token }
  */
}

/* ──────────────────────────── LEADS ──────────────────────────── */

/**
 * Fetch all leads, optionally filtered by assignee.
 * 🔌 API INTEGRATION POINT — GET /api/leads?assignedTo=userId
 *
 * @param {{ assignedTo?: string }} filters
 * @returns {Promise<object[]>}
 */
export async function fetchLeads(filters = {}) {
  await delay();

  let result = [...leads];
  if (filters.assignedTo) {
    result = result.filter(
      (l) => l.assignedTo === filters.assignedTo || l.createdByRole === 'employee'
    );
  }
  return result;

  /* 🔌 Real implementation:
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/api/leads?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
  */
}

/**
 * Update a lead's status.
 * 🔌 API INTEGRATION POINT — PATCH /api/leads/:id/status
 *
 * @param {string} leadId
 * @param {string} newStatus - 'New' | 'Contacted' | 'Responded'
 * @returns {Promise<object>} The updated lead
 */
export async function updateLeadStatus(leadId, newStatus) {
  await delay(300);

  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');
  leads[idx] = { ...leads[idx], status: newStatus };
  return leads[idx];

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
  */
}

/**
 * Update a lead's core details (name, email, phone, location, notes).
 * 🔌 API INTEGRATION POINT — PUT /api/leads/:id
 *
 * @param {string} leadId
 * @param {object} updates
 * @returns {Promise<object>} The updated lead
 */
export async function updateLeadDetails(leadId, updates) {
  await delay(300);

  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');
  leads[idx] = { ...leads[idx], ...updates };
  return leads[idx];

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
  */
}

/**
 * Assign a lead to an employee.
 * 🔌 API INTEGRATION POINT — PATCH /api/leads/:id/assign
 *
 * @param {string} leadId
 * @param {string} employeeId
 * @returns {Promise<object>} The updated lead
 */
export async function assignLead(leadId, employeeId) {
  await delay(300);

  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');
  leads[idx] = { ...leads[idx], assignedTo: employeeId };
  return leads[idx];

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) throw new Error('Failed to assign lead');
  return res.json();
  */
}

/**
 * Delete a lead.
 * 🔌 API INTEGRATION POINT — DELETE /api/leads/:id
 *
 * @param {string} leadId
 * @returns {Promise<void>}
 */
export async function deleteLead(leadId) {
  await delay(300);

  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');
  leads.splice(idx, 1);

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads/${leadId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete lead');
  */
}

/**
 * Delete all leads.
 * 🔌 API INTEGRATION POINT — DELETE /api/leads
 *
 * @returns {Promise<void>}
 */
export async function deleteAllLeads() {
  await delay(300);
  leads.length = 0; // clear array in place

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete all leads');
  */
}

/**
 * Add a new lead manually.
 * 🔌 API INTEGRATION POINT — POST /api/leads
 *
 * @param {object} leadData
 * @returns {Promise<object>} The created lead
 */
export async function addLead(leadData) {
  await delay(500);

  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...leadData,
    createdAt: new Date().toISOString(),
    activities: []
  };
  leads.unshift(newLead); // Add to beginning
  return newLead;
}

/**
 * Add an activity log to a lead.
 * 🔌 API INTEGRATION POINT — POST /api/leads/:id/activities
 *
 * @param {string} leadId
 * @param {object} activity
 * @returns {Promise<object>} The added activity
 */
export async function addLeadActivity(leadId, activity) {
  await delay(300);

  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');
  
  const newActivity = {
    id: `act_${Date.now()}`,
    date: new Date().toISOString(),
    ...activity
  };
  
  // Ensure array exists
  if (!leads[idx].activities) {
    leads[idx].activities = [];
  }
  
  leads[idx].activities.unshift(newActivity); // latest first
  return newActivity;
}

/* ──────────────────────────── EMPLOYEES ──────────────────────────── */

/**
 * Fetch all employees.
 * 🔌 API INTEGRATION POINT — GET /api/employees
 *
 * @returns {Promise<object[]>}
 */
export async function fetchEmployees() {
  await delay();
  return [...employees];

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
  */
}

/**
 * Add a new employee.
 * 🔌 API INTEGRATION POINT — POST /api/employees
 *
 * @param {{ name: string, email: string, phone: string, role: string }} data
 * @returns {Promise<object>} The created employee
 */
export async function addEmployee(data) {
  await delay(500);

  const newEmployee = {
    id: `usr_${Date.now()}`,
    ...data,
  };
  employees.push(newEmployee);
  return newEmployee;

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add employee');
  return res.json();
  */
}

/**
 * Delete an employee.
 * 🔌 API INTEGRATION POINT — DELETE /api/employees/:id
 *
 * @param {string} employeeId
 * @returns {Promise<void>}
 */
export async function deleteEmployee(employeeId) {
  await delay(300);

  const idx = employees.findIndex((e) => e.id === employeeId);
  if (idx === -1) throw new Error('Employee not found');
  employees.splice(idx, 1);

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/employees/${employeeId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to delete employee');
  */
}

/* ──────────────────────────── BULK IMPORT ──────────────────────────── */

/**
 * Bulk-import leads from an Excel/CSV upload.
 * 🔌 API INTEGRATION POINT — POST /api/leads/bulk-import
 *
 * Expected payload shape:
 * {
 *   "leads": [
 *     { "name": "...", "email": "...", "phone": "...", "status": "New", "assignedTo": "" },
 *     ...
 *   ]
 * }
 *
 * @param {{ leads: object[] }} payload
 * @returns {Promise<{ imported: number }>}
 */
export async function bulkImportLeads(payload) {
  await delay(800);

  // Mock: push each lead into the in-memory array
  const imported = payload.leads.map((lead) => ({
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    source: lead.source || lead.Source || '',
    name: lead.name || lead.Name || '',
    email: lead.email || lead.Email || '',
    phone: lead.phone || lead.Phone || '',
    location: lead.location || lead.Location || '',
    status: lead.status || lead.Status || 'New',
    assignedTo: lead.assignedTo || lead['Assigned to'] || lead.AssignedTo || null,
    notes: lead.notes || lead.Notes || '',
    createdAt: lead.createdAt || lead.CreatedAt || new Date().toISOString(),
    createdBy: lead.createdBy || null,
    createdByRole: lead.createdByRole || null,
  }));

  leads.push(...imported);
  return { imported: imported.length };

  /* 🔌 Real implementation:
  const res = await fetch(`${BASE_URL}/api/leads/bulk-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Bulk import failed');
  return res.json(); // expected: { imported: number }
  */
}
