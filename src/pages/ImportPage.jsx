import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadUploader from '../components/leads/LeadUploader';
import { useLeads } from '../hooks/useLeads';
import LeadsTable from '../components/leads/LeadsTable';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin page for bulk-importing leads from Excel/CSV files.
 */
export default function ImportPage() {
  const { role } = useAuth();
  const { leads, loading, updateStatus, refreshLeads } = useLeads();
  const { employees } = useEmployees();
  const navigate = useNavigate();

  const handleImportComplete = () => {
    refreshLeads();
    navigate('/');
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: '0.25rem',
            }}
          >
            Import Leads
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Upload an Excel or CSV file to bulk-import leads into the system.
          </p>
        </div>
      </div>

      <LeadUploader onImportComplete={handleImportComplete} />

    </div>
  );
}
