import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';
import './App.css';

/**
 * Root component — wraps the entire app with AuthProvider and the router.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
