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
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Add Employee ── */
  const addEmployee = useCallback(async (data) => {
    try {
      const created = await api.addEmployee(data);
      setEmployees((prev) => [...prev, created]);
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
      setEmployees((prev) => prev.map((e) => (e.id === employeeId ? updated : e)));
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
      setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
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
