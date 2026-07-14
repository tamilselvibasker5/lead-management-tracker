import { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import './LeadsTable.css';

/**
 * LeadsTable component.
 * Displays: Source, Name, Email, Phone, Location, Assigned to, Days Remaining, Call Attempts, Notes, and Actions.
 * Implements a 7-Day Aging Policy with visual alerts and inline Call Attempts tracking.
 *
 * @param {{
 *   leads?: object[],
 *   loading?: boolean,
 *   employees?: object[],
 *   onDeleteClick?: (lead: object) => void,
 * }} props
 */
export default function LeadsTable({
  leads: propLeads,
  loading = false,
  employees = [],
  onDeleteClick,
}) {
  const fileInputRef = useRef(null);

  // Default set of 3 mock rows (spread across Expiry, Warning, and Normal statuses)
  const defaultMockData = [
    {
      id: 'lead_default_1',
      source: 'Google Ads',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 019-2834',
      location: 'New York, USA',
      assignedTo: 'Sarah Connor',
      notes: 'Interested in product demo.',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago (Expired / Red)
      callCount: 2
    },
    {
      id: 'lead_default_2',
      source: 'Referral',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-014-9988',
      location: 'London, UK',
      assignedTo: 'John Connor',
      notes: 'Requested pricing information.',
      createdAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString(), // 5.5 days ago (Warning / Orange)
      callCount: 0
    },
    {
      id: 'lead_default_3',
      source: 'Cold Outreach',
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '+44 20 7946 0958',
      location: 'Manchester, UK',
      assignedTo: 'Sarah Connor',
      notes: 'Follow up next week.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (Normal / Green)
      callCount: 1
    }
  ];

  // Initialize state with default mock data
  const [leads, setLeads] = useState(defaultMockData);

  // Active sorting order state: 'oldest' | 'newest'
  const [sortOrder, setSortOrder] = useState('oldest');

  // Reactively compute the sorted leads array
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  }, [leads, sortOrder]);

  // Synchronize state when external leads are passed in
  useEffect(() => {
    if (propLeads && propLeads.length > 0) {
      const mapped = propLeads.map((l) => ({
        id: l.id,
        source: l.source || l.Source || '—',
        name: l.name || l.Name || '—',
        email: l.email || l.Email || '—',
        phone: l.phone || l.Phone || '—',
        location: l.location || l.Location || '—',
        assignedTo: typeof l.assignedTo === 'string' && l.assignedTo.startsWith('usr_')
          ? (employees.find((e) => e.id === l.assignedTo)?.name || l.assignedTo)
          : (l.assignedTo || l['Assigned to'] || l.AssignedTo || 'Unassigned'),
        notes: l.notes || l.Notes || '—',
        createdAt: l.createdAt || l.CreatedAt || new Date().toISOString(),
        callCount: Number(l.callCount || l.CallCount) || 0
      }));
      
      // Preserve any locally imported leads so they are not wiped out by parent renders
      setLeads((prev) => {
        const localImported = prev.filter((lead) => String(lead.id).startsWith('imported_'));
        return [...mapped, ...localImported];
      });
    }
  }, [propLeads, employees]);

  /**
   * Helper function to strip non-numeric characters (dashes, spaces, '+')
   * from the phone string before using it in Call/WhatsApp links.
   *
   * @param {string} phone
   * @returns {string}
   */
  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  /**
   * Calculates remaining days before the 7-day mark and returns
   * visual styling classes along with display values.
   *
   * @param {string} createdAt
   * @returns {{ rowClass: string, statusText: string, daysVal: number }}
   */
  const getExpiryDetails = (createdAt) => {
    if (!createdAt) return { rowClass: '', statusText: '—', daysVal: 0 };
    const createdTime = new Date(createdAt).getTime();
    const elapsedDays = (Date.now() - createdTime) / (24 * 60 * 60 * 1000);
    const remainingDays = 7 - elapsedDays;

    if (elapsedDays > 7) {
      return { rowClass: 'row-expired', statusText: 'Expired', daysVal: remainingDays };
    } else if (elapsedDays > 5) {
      return { rowClass: 'row-warning', statusText: `${remainingDays.toFixed(1)} days`, daysVal: remainingDays };
    } else {
      return { rowClass: 'row-normal', statusText: `${remainingDays.toFixed(1)} days`, daysVal: remainingDays };
    }
  };

  /**
   * Updates the call attempts count for a specific lead in the local state.
   *
   * @param {string} id
   * @param {number} count
   */
  const handleCallCountChange = (id, count) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, callCount: count } : lead))
    );
  };

  /**
   * Removes a specific lead row from the local state.
   *
   * @param {string} id
   */
  const handleDelete = (id) => {
    const leadToDelete = leads.find((l) => l.id === id);
    if (onDeleteClick && leadToDelete) {
      onDeleteClick(leadToDelete);
    }
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  /**
   * Parses an Excel file using the xlsx library and maps specific columns.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mappedLeads = jsonData.map((row, index) => {
          const getVal = (field) => {
            const key = Object.keys(row).find((k) => {
              const normalizedKey = k.trim().toLowerCase();
              if (field === 'source') {
                return ['source', 'lead source', 'campaign', 'campaign_name', 'campaign name', 'ad name', 'platform', 'medium', 'source/medium', 'channel', 'lead channel', 'marketing channel', 'ad source', 'source details'].includes(normalizedKey) || 
                  normalizedKey.includes('source') || 
                  normalizedKey.includes('campaign') || 
                  normalizedKey.includes('platform') || 
                  normalizedKey.includes('medium') || 
                  normalizedKey.includes('ad') || 
                  normalizedKey.includes('channel');
              }
              if (field === 'name') {
                return ['name', 'lead name', 'full name', 'contact name', 'customer name', 'client name', 'first name', 'first_name', 'student name'].includes(normalizedKey) || normalizedKey.includes('name') || normalizedKey.includes('person') || normalizedKey.includes('client');
              }
              if (field === 'email') {
                return ['email', 'email address', 'e-mail', 'mail', 'email id', 'mail id'].includes(normalizedKey) || normalizedKey.includes('email') || normalizedKey.includes('mail');
              }
              if (field === 'phone') {
                return ['phone', 'phone number', 'mobile', 'mobile number', 'contact', 'contact number', 'contact no', 'ph', 'ph number', 'ph no', 'whatsapp', 'whatsapp number'].includes(normalizedKey) || normalizedKey.includes('phone') || normalizedKey.includes('ph') || normalizedKey.includes('mobile') || normalizedKey.includes('contact') || normalizedKey.includes('number');
              }
              if (field === 'location') {
                return ['location', 'city', 'state', 'country', 'address', 'region'].includes(normalizedKey) || normalizedKey.includes('city') || normalizedKey.includes('location') || normalizedKey.includes('address');
              }
              if (field === 'assignedTo') {
                return ['assigned to', 'assigned to', 'assignee', 'owner', 'agent', 'executive', 'staff', 'employee'].includes(normalizedKey) || normalizedKey.includes('assign') || normalizedKey.includes('owner') || normalizedKey.includes('agent') || normalizedKey.includes('rep') || normalizedKey.includes('user');
              }
              if (field === 'notes') {
                return ['notes', 'remark', 'remarks', 'comments', 'note', 'description'].includes(normalizedKey) || normalizedKey.includes('note') || normalizedKey.includes('remark') || normalizedKey.includes('comment') || normalizedKey.includes('desc') || normalizedKey.includes('detail');
              }
              if (field === 'createdAt') {
                return ['created at', 'createdat', 'date', 'imported at', 'time', 'timestamp'].includes(normalizedKey) || normalizedKey.includes('date') || normalizedKey.includes('time') || normalizedKey.includes('create');
              }
              if (field === 'callCount') {
                return ['call count', 'call attempts', 'attempts', 'calls', 'callcount'].includes(normalizedKey) || normalizedKey.includes('attempt') || normalizedKey.includes('call');
              }
              return false;
            });
            return key ? String(row[key]) : '';
          };

          return {
            id: `imported_${Date.now()}_${index}`,
            source: getVal('source') || '—',
            name: getVal('name') || '—',
            email: getVal('email') || '—',
            phone: getVal('phone') || '—',
            location: getVal('location') || '—',
            assignedTo: getVal('assignedTo') || 'Unassigned',
            notes: getVal('notes') || '—',
            createdAt: getVal('createdAt') || new Date().toISOString(),
            callCount: Number(getVal('callCount')) || 0
          };
        });

        // Add imported leads to current table state
        setLeads((prev) => [...prev, ...mappedLeads]);
      } catch (err) {
        console.error('Error importing Excel file:', err);
        alert('Could not parse Excel file. Please make sure it is a valid .xlsx or .xls file.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset file input
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <Spinner />;

  return (
    <div className="leads-table-wrapper">
      {/* Toolbar */}
      <div className="leads-table__toolbar">
        <h3 className="leads-table__title">Leads Registry</h3>
        <span className="leads-table__filter-count" style={{ flex: 1, marginLeft: '1rem' }}>
          {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </span>
        
        {/* Sort & Import Control Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button 
            variant="secondary" 
            onClick={() => setSortOrder((prev) => (prev === 'oldest' ? 'newest' : 'oldest'))}
            title="Toggle sort order (Oldest / Newest)"
            style={{ minWidth: '150px' }}
          >
            {sortOrder === 'oldest' ? '⏰ Oldest First' : '⏰ Newest First'}
          </Button>
          <Button variant="primary" onClick={triggerFileInput}>
            📥 Import Excel
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
        />
      </div>

      {leads.length === 0 ? (
        <div className="leads-table__empty">
          <div className="leads-table__empty-icon">📭</div>
          <div className="leads-table__empty-text">No leads found</div>
        </div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Assigned to</th>
              <th>Days Remaining</th>
              <th>Call Attempts</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map((lead) => {
              const { rowClass, statusText } = getExpiryDetails(lead.createdAt);
              return (
                <tr key={lead.id} className={rowClass}>
                  <td className="leads-table__secondary" title={lead.source}>{lead.source || '—'}</td>
                  <td className="leads-table__name" title={lead.name}>
                    {lead.name || '—'}
                    {rowClass === 'row-expired' && (
                      <span className="leads-table__status-badge leads-table__status-badge--expired">
                        Expired
                      </span>
                    )}
                    {rowClass === 'row-warning' && (
                      <span className="leads-table__status-badge leads-table__status-badge--warning">
                        Urgent
                      </span>
                    )}
                  </td>
                  <td className="leads-table__secondary" title={lead.email}>
                    {lead.email && lead.email !== '—' ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="leads-table__link"
                        title={`Email ${lead.name}`}
                      >
                        {lead.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="leads-table__secondary" title={lead.phone}>
                    {lead.phone && lead.phone !== '—' ? (
                      <a
                        href={`tel:${cleanPhoneNumber(lead.phone)}`}
                        className="leads-table__link"
                        title={`Call ${lead.name}`}
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="leads-table__secondary" title={lead.location}>{lead.location || '—'}</td>
                  <td title={lead.assignedTo}>
                    <span className="leads-table__assigned">
                      {lead.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td 
                    className="leads-table__secondary" 
                    style={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: '600',
                      color: rowClass === 'row-expired' ? 'var(--color-danger)' : rowClass === 'row-warning' ? 'var(--color-warning)' : 'inherit'
                    }}
                    title={statusText}
                  >
                    {statusText}
                  </td>
                  <td>
                    <select
                      value={lead.callCount || 0}
                      onChange={(e) => handleCallCountChange(lead.id, Number(e.target.value))}
                      className="leads-table__call-select"
                      title={`Call attempts for ${lead.name}`}
                    >
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'attempt' : 'attempts'}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="leads-table__secondary leads-table__notes" title={lead.notes}>
                    {lead.notes || '—'}
                  </td>
                  <td>
                    <div className="leads-table__actions" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {lead.phone && lead.phone !== '—' ? (
                        <>
                          <a
                            href={`tel:${cleanPhoneNumber(lead.phone)}`}
                            className="btn leads-table__call-btn leads-table__icon-btn"
                            title="Call Lead"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhoneNumber(lead.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn leads-table__whatsapp-btn leads-table__icon-btn"
                            title="Chat on WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-dimmed)', fontStyle: 'italic' }}>
                          No contact
                        </span>
                      )}
                      <Button
                        variant="danger"
                        className="leads-table__icon-btn leads-table__delete-btn"
                        onClick={() => handleDelete(lead.id)}
                        title="Delete Lead"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
