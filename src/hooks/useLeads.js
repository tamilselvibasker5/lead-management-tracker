import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roles';
import * as api from '../services/api';

/**
 * Custom hook that fetches leads and provides mutation helpers.
 *
 * - For EMPLOYEE role: automatically filters to only their assigned leads.
 * - For ADMIN / SUPER_ADMIN: returns all leads.
 *
 * @returns {{
 *   leads: object[],
 *   loading: boolean,
 *   error: string|null,
 *   updateStatus: (leadId: string, newStatus: string) => Promise<void>,
 *   assignLead: (leadId: string, employeeId: string) => Promise<void>,
 *   addLead: (leadData: object) => Promise<void>,
 *   addLeadActivity: (leadId: string, activity: object) => Promise<void>,
 *   refreshLeads: () => Promise<void>,
 * }}
 */
export function useLeads() {
  const { user, role } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (role === ROLES.EMPLOYEE && user?.id) {
        filters.assignedTo = user.id;
      }

      const data = await api.fetchLeads(filters);
      setLeads(data);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [role, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Update Status (optimistic) ── */
  const updateStatus = useCallback(async (leadId, newStatus) => {
    // Snapshot for rollback
    setLeads((prev) => {
      const snapshot = prev;
      const updated = prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      );

      // Fire API call; rollback on failure
      api.updateLeadStatus(leadId, newStatus).catch(() => {
        setLeads(snapshot);
        setError('Failed to update status — reverted');
      });

      return updated;
    });
  }, []);

  /* ── Assign Lead ── */
  const assignLead = useCallback(async (leadId, employeeId) => {
    try {
      const updated = await api.assignLead(leadId, employeeId);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updated } : l))
      );
    } catch (err) {
      setError(err.message || 'Failed to assign lead');
    }
  }, []);

  /* ── Delete Lead ── */
  const deleteLead = useCallback(async (leadId) => {
    try {
      await api.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      setError(err.message || 'Failed to delete lead');
      throw err;
    }
  }, []);

  /* ── Update Lead Details ── */
  const updateLeadDetails = useCallback(async (leadId, updates) => {
    try {
      const updated = await api.updateLeadDetails(leadId, updates);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updated } : l))
      );
    } catch (err) {
      setError(err.message || 'Failed to update lead');
      throw err;
    }
  }, []);

  /* ── Delete All Leads ── */
  const deleteAllLeads = useCallback(async () => {
    try {
      await api.deleteAllLeads();
      setLeads([]);
    } catch (err) {
      setError(err.message || 'Failed to delete all leads');
      throw err;
    }
  }, []);

  /* ── Add Lead ── */
  const addLead = useCallback(async (leadData) => {
    try {
      const newLead = await api.addLead(leadData);
      setLeads((prev) => [newLead, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to add lead');
      throw err;
    }
  }, []);

  /* ── Add Lead Activity ── */
  const addLeadActivity = useCallback(async (leadId, activity) => {
    try {
      const newActivity = await api.addLeadActivity(leadId, activity);
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === leadId) {
            return {
              ...l,
              activities: [newActivity, ...(l.activities || [])]
            };
          }
          return l;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to add activity');
      throw err;
    }
  }, []);

  return {
    leads,
    loading,
    error,
    updateStatus,
    assignLead,
    deleteLead,
    updateLeadDetails,
    deleteAllLeads,
    addLead,
    addLeadActivity,
    refreshLeads: fetchData,
  };
}
