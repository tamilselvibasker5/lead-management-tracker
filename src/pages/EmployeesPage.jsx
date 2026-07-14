import { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { ROLE_LABELS } from '../utils/roles';
import Button from '../components/common/Button';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import Spinner from '../components/common/Spinner';

/**
 * Admin-only page for managing employees.
 */
export default function EmployeesPage() {
  const { employees, loading, addEmployee, deleteEmployee } = useEmployees();
  const [modalOpen, setModalOpen] = useState(false);

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
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="leads-table__name">{emp.name}</td>
                  <td className="leads-table__secondary">{emp.email}</td>
                  <td className="leads-table__secondary">{emp.phone}</td>
                  <td>
                    <span className="leads-table__assigned">
                      {ROLE_LABELS[emp.role] || emp.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
    </div>
  );
}
