/**
 * Centralized API module with complete localStorage persistence.
 */

import mockUsers from '../mocks/users';
import mockLeadsData from '../mocks/leads';
import mockEmployeesData from '../mocks/employees';
import { autoAssignLead } from '../utils/assignmentRules';

const BASE_URL = '';
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const LEADS_STORAGE_KEY = 'lead_tracker_leads';
const EMPLOYEES_STORAGE_KEY = 'lead_tracker_employees';

/* ────── localStorage Helpers ────── */
function loadLeadsFromStorage() {
  try {
    const data = localStorage.getItem(LEADS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading leads from localStorage:', e);
  }
  return [...mockLeadsData];
}

function saveLeadsToStorage(leadsArray) {
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leadsArray));
  } catch (e) {
    console.error('Error saving leads to localStorage:', e);
  }
}

function loadEmployeesFromStorage() {
  try {
    const data = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading employees from localStorage:', e);
  }
  return [...mockEmployeesData];
}

function saveEmployeesToStorage(employeesArray) {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employeesArray));
  } catch (e) {
    console.error('Error saving employees to localStorage:', e);
  }
}

// Initialize state from localStorage
let leads = loadLeadsFromStorage();
let employees = loadEmployeesFromStorage();

/* ──────────────────────────── AUTH ──────────────────────────── */

export async function login(email, password) {
  await delay(400);

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: `mock_token_${user.id}` };
}

/* ──────────────────────────── LEADS ──────────────────────────── */

export async function fetchLeads(filters = {}) {
  await delay(200);
  leads = loadLeadsFromStorage();

  let result = [...leads];
  if (filters.assignedTo) {
    result = result.filter(
      (l) => l.assignedTo === filters.assignedTo || l.createdByRole === 'employee'
    );
  }
  return result;
}

export async function updateLeadStatus(leadId, newStatus) {
  await delay(200);

  leads = loadLeadsFromStorage();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');

  leads[idx] = { ...leads[idx], status: newStatus };
  saveLeadsToStorage(leads);
  return leads[idx];
}

export async function updateLeadDetails(leadId, updates) {
  await delay(200);

  leads = loadLeadsFromStorage();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');

  leads[idx] = { ...leads[idx], ...updates };
  saveLeadsToStorage(leads);
  return leads[idx];
}

export async function assignLead(leadId, employeeId) {
  await delay(200);

  leads = loadLeadsFromStorage();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');

  leads[idx] = { ...leads[idx], assignedTo: employeeId };
  saveLeadsToStorage(leads);
  return leads[idx];
}

export async function deleteLead(leadId) {
  await delay(200);

  leads = loadLeadsFromStorage();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');

  leads.splice(idx, 1);
  saveLeadsToStorage(leads);
}

export async function deleteAllLeads() {
  await delay(200);

  leads = [];
  saveLeadsToStorage(leads);
}

export async function addLead(leadData) {
  await delay(300);

  leads = loadLeadsFromStorage();
  employees = loadEmployeesFromStorage();
  const autoAssigned = autoAssignLead(leadData, '', employees);

  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...leadData,
    assignedTo: leadData.assignedTo || (autoAssigned !== 'Unassigned' ? autoAssigned : 'Unassigned'),
    createdAt: new Date().toISOString(),
    activities: []
  };

  leads.unshift(newLead);
  saveLeadsToStorage(leads);
  return newLead;
}

export async function bulkImportLeads(importedLeads) {
  await delay(300);

  leads = loadLeadsFromStorage();
  employees = loadEmployeesFromStorage();
  const formatted = importedLeads.map((item, idx) => {
    const locationVal = item.location || item.Location || item.Address || item.City || item.State || item.Place || '';
    const autoAssigned = autoAssignLead(item, '', employees);

    return {
      id: item.id || `imported_${Date.now()}_${idx}`,
      platform: item.platform || item.Platform || item.Source || '—',
      name: item.name || item.Name || '—',
      email: item.email || item.Email || '—',
      phone: item.phone || item.Phone || '—',
      location: locationVal || '—',
      assignedTo: autoAssigned !== 'Unassigned' ? autoAssigned : (item.assignedTo || item['Assigned to'] || 'Unassigned'),
      notes: item.notes || item.Notes || '—',
      createdAt: item.createdAt || new Date().toISOString(),
      callCount: Number(item.callCount) || 0,
      activities: item.activities || []
    };
  });

  leads.unshift(...formatted);
  saveLeadsToStorage(leads);
  return formatted;
}

export async function addLeadActivity(leadId, activity) {
  await delay(200);

  leads = loadLeadsFromStorage();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) throw new Error('Lead not found');

  const newActivity = {
    id: `act_${Date.now()}`,
    date: new Date().toISOString(),
    ...activity
  };

  if (!leads[idx].activities) {
    leads[idx].activities = [];
  }

  leads[idx].activities.unshift(newActivity);
  saveLeadsToStorage(leads);
  return newActivity;
}

/* ──────────────────────────── EMPLOYEES ──────────────────────────── */

export async function fetchEmployees() {
  await delay(200);
  employees = loadEmployeesFromStorage();
  return [...employees];
}

export async function addEmployee(data) {
  await delay(300);

  employees = loadEmployeesFromStorage();
  const newEmployee = {
    id: `usr_${Date.now()}`,
    ...data,
  };
  employees.push(newEmployee);
  saveEmployeesToStorage(employees);
  return newEmployee;
}

export async function updateEmployee(employeeId, updatedData) {
  await delay(300);

  employees = loadEmployeesFromStorage();
  const idx = employees.findIndex((e) => e.id === employeeId);
  if (idx === -1) throw new Error('Employee not found');

  employees[idx] = { ...employees[idx], ...updatedData };
  saveEmployeesToStorage(employees);
  return employees[idx];
}

export async function deleteEmployee(employeeId) {
  await delay(200);

  employees = loadEmployeesFromStorage();
  const idx = employees.findIndex((e) => e.id === employeeId);
  if (idx === -1) throw new Error('Employee not found');

  employees.splice(idx, 1);
  saveEmployeesToStorage(employees);
}
