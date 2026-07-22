import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../utils/roles';
import PrivateRoute from './PrivateRoute';

/* ── Layout ── */
import DashboardLayout from '../components/layout/DashboardLayout';

/* ── Pages ── */
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import LeadsPage from '../pages/LeadsPage';
import ProductsPage from '../pages/ProductsPage';
import AssignmentPage from '../pages/AssignmentPage';
import EmployeesPage from '../pages/EmployeesPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ImportPage from '../pages/ImportPage';
import SettingsPage from '../pages/SettingsPage';

/**
 * Central route definitions for the entire application.
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── All authenticated users ── */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Admin only ── */}
          <Route
            element={
              <PrivateRoute
                allowedRoles={[ROLES.ADMIN]}
              />
            }
          >
            <Route path="/assignment" element={<AssignmentPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
          </Route>

        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
