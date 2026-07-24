import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

/**
 * Custom hook that fetches employees and provides mutation helpers.
 *
 * @returns {{
 *   employees: object[],
 *   loading: boolean,
 *   error: string|null,
 *   addEmployee: (data: object) => Promise<object>,
 *   refreshEmployees: () => Promise<void>,
 * }}
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchEmployees();
      setEmployees(data);
      try {
        localStorage.setItem('lead_tracker_employees', JSON.stringify(data));
      } catch (_) {}
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Sync on external/profile updates ── */
  useEffect(() => {
    const handleEmployeesUpdated = () => {
      try {
        const stored = localStorage.getItem('lead_tracker_employees');
        if (stored) {
          setEmployees(JSON.parse(stored));
        }
      } catch (_) {}
    };

    window.addEventListener('employees_updated', handleEmployeesUpdated);
    return () => {
      window.removeEventListener('employees_updated', handleEmployeesUpdated);
    };
  }, []);

  /* ── Add Employee ── */
  const addEmployee = useCallback(async (data) => {
    try {
      const created = await api.addEmployee(data);
      setEmployees((prev) => {
        const next = [...prev, created];
        try {
          localStorage.setItem('lead_tracker_employees', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      window.dispatchEvent(new Event('employees_updated'));
      return created;
    } catch (err) {
      setError(err.message || 'Failed to add employee');
      throw err;
    }
  }, []);

  /* ── Update Employee ── */
  const updateEmployee = useCallback(async (employeeId, data) => {
    try {
      const updated = await api.updateEmployee(employeeId, data);
      setEmployees((prev) => {
        const next = prev.map((e) =>
          e.id === employeeId || e._id === employeeId ? updated : e
        );
        try {
          localStorage.setItem('lead_tracker_employees', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      window.dispatchEvent(new Event('employees_updated'));
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update employee');
      throw err;
    }
  }, []);

  /* ── Delete Employee ── */
  const deleteEmployee = useCallback(async (employeeId) => {
    try {
      await api.deleteEmployee(employeeId);
      setEmployees((prev) => {
        const next = prev.filter((e) => e.id !== employeeId && e._id !== employeeId);
        try {
          localStorage.setItem('lead_tracker_employees', JSON.stringify(next));
        } catch (_) {}
        return next;
      });
      window.dispatchEvent(new Event('employees_updated'));
    } catch (err) {
      setError(err.message || 'Failed to delete employee');
      throw err;
    }
  }, []);

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refreshEmployees: fetchData,
  };
}
