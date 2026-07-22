import { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { ROLE_LABELS } from '../utils/roles';
import Button from '../components/common/Button';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EditEmployeeModal from '../components/employees/EditEmployeeModal';
import Spinner from '../components/common/Spinner';

/**
 * Admin-only page for managing employees.
 */
export default function EmployeesPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleDelete = async (employee) => {
    if (window.confirm(`Are you sure you want to remove ${employee.name}?`)) {
      try {
        await deleteEmployee(employee.id);
      } catch (err) {
        console.error('Failed to remove employee:', err);
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          Employees
        </h2>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add Employee
        </Button>
      </div>

      <div
        className="leads-table-wrapper"
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        {employees.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--color-text-dimmed)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              🏢
            </div>
            <div style={{ fontWeight: 500 }}>No employees yet</div>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location / Region</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="employees-table__name" title={emp.name}>{emp.name}</td>
                  <td className="employees-table__secondary" title={emp.email}>{emp.email}</td>
                  <td className="employees-table__secondary" title={emp.phone}>{emp.phone}</td>
                  <td className="employees-table__secondary" title={emp.location}>{emp.location || '—'}</td>
                  <td>
                    <span className="leads-table__assigned">
                      {ROLE_LABELS[emp.role] || emp.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingEmployee(emp)}
                        title="Edit Employee"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(emp)}
                        title="Remove Employee"
                      >
                        🗑 Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddEmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addEmployee}
      />

      <EditEmployeeModal
        isOpen={!!editingEmployee}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onUpdate={updateEmployee}
      />
    </div>
  );
}
