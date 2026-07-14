import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './DashboardLayout.css';

/**
 * Shell layout that wraps Sidebar + TopBar around page content.
 */

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/assignment': 'Assign Leads',
  '/employees': 'Employees',
  '/import': 'Import Leads',
  '/unauthorized': 'Access Denied',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-layout__main">
        <TopBar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          pageTitle={pageTitle}
        />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
