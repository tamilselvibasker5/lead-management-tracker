import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRouter from './routes/AppRouter';
import './App.css';

/**
 * Root component — wraps the entire app with AuthProvider, NotificationProvider, ToastProvider and the router.
 */
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
