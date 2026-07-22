import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { ROLES } from '../utils/roles';
import Spinner from '../components/common/Spinner';
import {
  Users,
  Sparkles,
  CheckCircle2,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import './DashboardPage.css';

/**
 * Main dashboard that renders the high-level progress stats.
 * Includes Analytics for Admin.
 */
export default function DashboardPage() {
  const { role } = useAuth();
  const { leads, loading, error } = useLeads();

  const isAdmin = role === ROLES.ADMIN;

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === 'New').length;
    const qualified = leads.filter((l) => l.status === 'Qualified').length;
    const won = leads.filter((l) => l.status === 'Won').length;
    const lost = leads.filter((l) => l.status === 'Lost').length;
    return { total, newCount, qualified, won, lost };
  }, [leads]);

  const followUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return leads.filter(l => {
      if (!l.followUpDate) return false;
      const fDate = new Date(l.followUpDate);
      return fDate < tomorrow && l.status !== 'Won' && l.status !== 'Lost';
    });
  }, [leads]);

  /* ── Analytics Data ── */
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const platformData = useMemo(() => {
    const counts = {};
    leads.forEach((l) => {
      const plat = l.platform || l.source || 'Unknown';
      counts[plat] = (counts[plat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const statusData = useMemo(() => {
    const counts = {};
    leads.forEach((l) => {
      const st = l.status || 'New';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const revenueData = [
    { month: 'Jan', revenue: 4000, target: 2400 },
    { month: 'Feb', revenue: 5000, target: 2800 },
    { month: 'Mar', revenue: 6000, target: 3500 },
    { month: 'Apr', revenue: 8500, target: 4000 },
    { month: 'May', revenue: 7800, target: 5000 },
    { month: 'Jun', revenue: 11000, target: 7000 },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── Stats ── */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--total">
            <Users size={22} />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.total}</span>
            <span className="stat-card__label">Total Leads</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--new">
            <Sparkles size={22} />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.newCount}</span>
            <span className="stat-card__label">New</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--contacted" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.qualified}</span>
            <span className="stat-card__label">Qualified</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--responded" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Trophy size={22} />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.won}</span>
            <span className="stat-card__label">Won</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--responded" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
            <XCircle size={22} />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.lost}</span>
            <span className="stat-card__label">Lost</span>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.1)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            marginTop: '2rem'
          }}
        >
          {error}
        </div>
      )}

      {/* ── Follow Up Widget ── */}
      <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
          Due Follow-ups ({followUps.length})
        </h3>
        {followUps.length === 0 ? (
          <p style={{ color: 'var(--color-text-dimmed)', fontSize: '0.9rem' }}>No follow-ups due today.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {followUps.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-error)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>{l.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-dimmed)' }}>{l.phone}</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-error)' }}>
                  {new Date(l.followUpDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Analytics (Admin Only) ── */}
      {isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Revenue Growth Bar Chart */}
          <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Revenue Growth (Projected)</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-dimmed)" fontSize={12} />
                  <YAxis stroke="var(--color-text-dimmed)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} 
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="revenue" fill="var(--color-primary)" name="Actual Revenue ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#10b981" name="Target ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Platform Pie Chart */}
          <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Lead Platforms</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} 
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Status Pipeline */}
          <div style={{ background: 'var(--color-surface-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>Lead Status Pipeline</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-dimmed)" fontSize={12} />
                  <YAxis stroke="var(--color-text-dimmed)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} 
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
