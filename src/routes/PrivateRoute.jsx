import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PrivateRoute — RBAC guard wrapper.
 *
 * Usage in your route config:
 *   <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]} />}>
 *     <Route path="/admin-page" element={<AdminPage />} />
 *   </Route>
 *
 * @param {{ allowedRoles?: string[] }} props
 *   If `allowedRoles` is omitted, any authenticated user can access.
 */
export default function PrivateRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  // Still hydrating from localStorage — show nothing to avoid flash
  if (loading) return null;

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not permitted → 403
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorised → render child routes
  return <Outlet />;
}
