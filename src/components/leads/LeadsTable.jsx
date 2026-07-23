import { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { autoAssignLead } from '../../utils/assignmentRules';
import * as api from '../../services/api';
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
import { Inbox, Check, X, Pencil, UploadCloud, DownloadCloud, Search, Trash2, ArrowUpDown, Filter, Notebook, ArrowRightLeft } from 'lucide-react';
import NotepadModal from './NotepadModal';
import SwapLeadModal from './SwapLeadModal';
import { useAuth } from '../../contexts/AuthContext';

export default function LeadsTable({
  leads: propLeads,
  loading = false,
  employees = [],
  currentUserRole,
  onEditClick,
  onDeleteClick,
  onDeleteAllClick,
  onAssignLead,
  onSwapLead,
  onUpdateLeadDetails,
  onAddActivity,
  onStatusChange,
  showAssignAction = false,
  hideImportExcel = false,
}) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Default set of mock rows (empty by default)
  const defaultMockData = [];

  // Internal state tracking leads
  const [leads, setLeads] = useState(propLeads || defaultMockData);

  useEffect(() => {
    if (propLeads) {
      setLeads(propLeads);
    }
  }, [propLeads]);

  // Bulk actions state
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // Active sorting order state: 'oldest' | 'newest'
  const [sortOrder, setSortOrder] = useState('oldest');

  // Popup Notepad Modal state
  const [activeNotepadLead, setActiveNotepadLead] = useState(null);

  // Swap Lead Modal state
  const [swapLeadModalOpen, setSwapLeadModalOpen] = useState(false);
  const [leadToSwap, setLeadToSwap] = useState(null);

  const handleOpenSwapModal = (lead) => {
    setLeadToSwap(lead);
    setSwapLeadModalOpen(true);
  };

  const handleConfirmSwap = async (leadId, targetEmployeeId, targetEmployeeName, reason) => {
    // Local optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, assignedTo: targetEmployeeName, assignedToRaw: targetEmployeeId }
          : l
      )
    );

    try {
      if (onSwapLead) {
        await onSwapLead(leadId, targetEmployeeId, targetEmployeeName, reason);
      } else {
        await api.swapLead(
          leadId,
          targetEmployeeId,
          targetEmployeeName,
          reason,
          user?.id,
          user?.name
        );
      }
    } catch (err) {
      console.error('Failed to swap lead:', err);
    }
  };


  const handleOpenNotepad = (lead) => {
    setActiveNotepadLead(lead);
  };

  const handleSaveNotepad = async (leadId, updates) => {
    const newNotes = updates.notes;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: newNotes } : l))
    );
    if (onUpdateLeadDetails) {
      try {
        await onUpdateLeadDetails(leadId, { notes: newNotes });
      } catch (err) {
        console.error('Failed to update notes:', err);
      }
    }
  };

  const handleStatusChangeLocal = async (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (onStatusChange) {
      try {
        await onStatusChange(leadId, newStatus);
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }
  };

  const handleExportExcel = () => {
    const dataToExport = (selectedLeadIds.length > 0
      ? filteredLeads.filter((l) => selectedLeadIds.includes(l.id))
      : filteredLeads
    ).map((l) => ({
      Platform: l.platform || '—',
      Name: l.name || '—',
      Email: l.email || '—',
      Phone: l.phone || '—',
      Location: l.location || '—',
      Status: l.status || 'New',
      'Assigned To': getAssigneeDisplay(l.assignedToRaw),
      'Call Attempts': l.callCount || 0,
      Notes: l.notes || '—',
      'Created At': l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, `Leads_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Dropdown filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');

  // Dynamically extract unique platform options from leads
  const platformOptions = useMemo(() => {
    const platforms = new Set();
    leads.forEach((l) => {
      if (l.platform && l.platform !== '—') platforms.add(l.platform);
    });
    return Array.from(platforms);
  }, [leads]);

  // Reactively compute the sorted leads array
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  }, [leads, sortOrder]);

  // Filter leads based on search query, status dropdown, platform dropdown, and assignment dropdown
  const filteredLeads = useMemo(() => {
    return sortedLeads.filter((l) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          (l.name && l.name.toLowerCase().includes(term)) ||
          (l.email && l.email.toLowerCase().includes(term)) ||
          (l.phone && l.phone.toLowerCase().includes(term)) ||
          (l.location && l.location.toLowerCase().includes(term)) ||
          (l.platform && l.platform.toLowerCase().includes(term)) ||
          (l.notes && l.notes.toLowerCase().includes(term));
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'all') {
        if ((l.status || 'New').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (platformFilter !== 'all') {
        if ((l.platform || '').toLowerCase() !== platformFilter.toLowerCase()) {
          return false;
        }
      }

      if (assignmentFilter !== 'all') {
        const raw = String(l.assignedToRaw || '').trim();
        const name = String(l.assignedTo || '').trim();

        const isAssigned =
          (raw !== '' && raw !== 'null' && raw !== 'undefined' && raw !== 'Unassigned' && raw !== '—') ||
          (name !== '' && name !== 'null' && name !== 'undefined' && name !== 'Unassigned' && name !== '—');

        if (assignmentFilter === 'assigned' && !isAssigned) return false;
        if (assignmentFilter === 'unassigned' && isAssigned) return false;
      }

      return true;
    });
  }, [sortedLeads, searchTerm, statusFilter, platformFilter, assignmentFilter]);

  // Synchronize state when external leads are passed in
  useEffect(() => {
    if (Array.isArray(propLeads)) {
      const mapped = propLeads.map((l) => ({
        id: l.id,
        platform: l.platform || l.Platform || l.source || l.Source || '—',
        name: l.name || l.Name || '—',
        email: l.email || l.Email || '—',
        phone: l.phone || l.Phone || '—',
        location: l.location || l.Location || '—',
        assignedTo: typeof l.assignedTo === 'string' && l.assignedTo.startsWith('usr_')
          ? (employees.find((e) => e.id === l.assignedTo)?.name || l.assignedTo)
          : (l.assignedTo || l['Assigned to'] || l.AssignedTo || 'Unassigned'),
        assignedToRaw: typeof l.assignedTo === 'string'
          ? l.assignedTo
          : (l['Assigned to'] || l.AssignedTo || ''),
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

  const getAssigneeDisplay = (assignedTo) => {
    if (!assignedTo) return 'Unassigned';
    if (typeof assignedTo === 'string' && assignedTo.startsWith('usr_')) {
      const emp = employees.find((e) => e.id === assignedTo);
      return emp ? emp.name : assignedTo;
    }
    return assignedTo;
  };

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
    if (isNaN(createdTime)) return { rowClass: '', statusText: '—', daysVal: 0 };

    const elapsedDays = (Date.now() - createdTime) / (24 * 60 * 60 * 1000);
    const remainingDays = 7 - elapsedDays;

    if (remainingDays <= 0) {
      return { rowClass: 'row-expired', statusText: 'Expired', daysVal: 0 };
    } else if (remainingDays <= 2) {
      return { rowClass: 'row-warning', statusText: `${remainingDays.toFixed(1)} days remaining`, daysVal: remainingDays };
    } else {
      return { rowClass: 'row-normal', statusText: `${remainingDays.toFixed(1)} days remaining`, daysVal: remainingDays };
    }
  };

  /**
   * Updates the call attempts count for a specific lead in the local state.
   *
   * @param {string} id
   * @param {number} count
   */
  const handleCallCountChange = (id, count) => {
    setLeads((prev) => {
      const updated = prev.map((lead) => (lead.id === id ? { ...lead, callCount: count } : lead));
      try {
        localStorage.setItem('lead_tracker_leads', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return updated;
    });
    if (onUpdateLeadDetails) {
      onUpdateLeadDetails(id, { callCount: count }).catch((err) =>
        console.error('Failed to sync callCount:', err)
      );
    }
  };

  /**
   * Automatically increments the call attempts counter when the call button/link is clicked.
   *
   * @param {string} id
   */
  const handleCallClick = (id) => {
    let newCount = 1;
    setLeads((prev) => {
      const updated = prev.map((lead) => {
        if (lead.id === id) {
          const currentCount = Number(lead.callCount) || 0;
          newCount = currentCount + 1;
          return { ...lead, callCount: newCount };
        }
        return lead;
      });
      try {
        localStorage.setItem('lead_tracker_leads', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      return updated;
    });
    if (onUpdateLeadDetails) {
      onUpdateLeadDetails(id, { callCount: newCount }).catch((err) =>
        console.error('Failed to sync callCount:', err)
      );
    }
  };

  const handleBulkAssign = async (e) => {
    const empId = e.target.value;
    if (!empId || selectedLeadIds.length === 0) return;
    const selectedEmp = employees.find((emp) => emp.id === empId);
    const empName = selectedEmp ? selectedEmp.name : 'Unassigned';

    try {
      for (const id of selectedLeadIds) {
        if (onAssignLead) {
          await onAssignLead(id, empId);
        }
      }
      setLeads((prev) =>
        prev.map((l) =>
          selectedLeadIds.includes(l.id)
            ? { ...l, assignedTo: empName, assignedToRaw: empId }
            : l
        )
      );
      setSelectedLeadIds([]);
      e.target.value = '';
    } catch (err) {
      console.error('Failed to bulk assign leads:', err);
    }
  };

  const handleBulkStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || selectedLeadIds.length === 0) return;

    try {
      for (const id of selectedLeadIds) {
        if (onStatusChange) {
          await onStatusChange(id, newStatus);
        }
      }
      setLeads((prev) =>
        prev.map((l) =>
          selectedLeadIds.includes(l.id) ? { ...l, status: newStatus } : l
        )
      );
      setSelectedLeadIds([]);
      e.target.value = '';
    } catch (err) {
      console.error('Failed to bulk change status:', err);
    }
  };

  /**
   * Selection Handlers
   */
  const isAllSelected = sortedLeads.length > 0 && selectedLeadIds.length === sortedLeads.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(sortedLeads.map((l) => l.id));
    }
  };

  const handleRowSelectToggle = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Deletes a single lead by ID.
   */
  const handleDelete = async (leadId) => {
    const leadObj = leads.find((l) => l.id === leadId);
    const leadName = leadObj ? leadObj.name : 'this lead';

    if (window.confirm(`Are you sure you want to delete "${leadName}"?`)) {
      try {
        if (onDeleteClick) {
          await onDeleteClick(leadId, leadObj);
        }
        setLeads((prev) => {
          const updated = prev.filter((l) => l.id !== leadId);
          try {
            localStorage.setItem('lead_tracker_leads', JSON.stringify(updated));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          return updated;
        });
        setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
      } catch (err) {
        console.error('Failed to delete lead:', err);
      }
    }
  };

  /**
   * Deletes all currently selected leads.
   */
  const handleDeleteSelected = async () => {
    if (selectedLeadIds.length === 0) return;
    const count = selectedLeadIds.length;
    if (
      window.confirm(
        `Are you sure you want to completely delete ${count} selected lead(s)?`
      )
    ) {
      try {
        const idsToDelete = [...selectedLeadIds];
        for (const id of idsToDelete) {
          if (onDeleteClick) {
            const leadObj = leads.find((l) => l.id === id);
            await onDeleteClick(id, leadObj);
          }
        }
        setLeads((prev) => {
          const updated = prev.filter((l) => !idsToDelete.includes(l.id));
          try {
            localStorage.setItem('lead_tracker_leads', JSON.stringify(updated));
          } catch (e) {
            console.error('Error saving to localStorage:', e);
          }
          return updated;
        });
        setSelectedLeadIds([]);
      } catch (err) {
        console.error('Failed to delete selected leads:', err);
      }
    }
  };

  /**
   * Automatically assigns all leads in the table based on location and language matching.
   */
  const handleAutoAssignAll = async () => {
    if (!leads || leads.length === 0) return;

    let assignedCount = 0;
    const updatedLeads = [...leads];

    for (let i = 0; i < updatedLeads.length; i++) {
      const lead = updatedLeads[i];
      const matchedEmpId = autoAssignLead(lead, '', employees);

      if (matchedEmpId && matchedEmpId !== 'Unassigned' && matchedEmpId !== lead.assignedTo && matchedEmpId !== lead.assignedToRaw) {
        assignedCount++;
        updatedLeads[i] = {
          ...lead,
          assignedTo: matchedEmpId,
          assignedToRaw: matchedEmpId
        };

        if (onAssignLead) {
          try {
            await onAssignLead(lead.id, matchedEmpId);
          } catch (err) {
            console.error('Failed to assign lead via callback:', err);
          }
        }
      }
    }

    setLeads(updatedLeads);
    try {
      localStorage.setItem('lead_tracker_leads', JSON.stringify(updatedLeads));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    alert(`⚡ Auto-assigned ${assignedCount} lead(s) based on location & language matching!`);
  };

  /**
   * Removes all leads from local state after calling onDeleteAllClick callback.
   */
  const handleDeleteAll = async () => {
    if (onDeleteAllClick) {
      await onDeleteAllClick();
    }
    setLeads([]);
    try {
      localStorage.setItem('lead_tracker_leads', JSON.stringify([]));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
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
    reader.onload = async (event) => {
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
              if (field === 'platform') {
                return ['platform', 'source', 'lead source', 'campaign', 'campaign_name', 'campaign name', 'ad name', 'medium', 'source/medium', 'channel', 'lead channel', 'marketing channel', 'ad source', 'source details', 'ig', 'fb', 'instagram', 'facebook'].includes(normalizedKey) ||
                  normalizedKey.includes('platform') ||
                  normalizedKey.includes('source') ||
                  normalizedKey.includes('campaign') ||
                  normalizedKey.includes('medium') ||
                  normalizedKey.includes('ad') ||
                  normalizedKey.includes('channel') ||
                  normalizedKey === 'ig' ||
                  normalizedKey === 'fb';
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
            platform: getVal('platform') || '—',
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

        // Save imported leads to MongoDB via API backend
        try {
          const savedLeads = await api.bulkImportLeads(mappedLeads, user?.id, currentUserRole);
          if (Array.isArray(savedLeads) && savedLeads.length > 0) {
            setLeads((prev) => [...savedLeads, ...prev]);
          } else {
            setLeads((prev) => [...mappedLeads, ...prev]);
          }
        } catch (apiErr) {
          console.error('Failed to save imported leads to backend:', apiErr);
          setLeads((prev) => [...mappedLeads, ...prev]);
        }

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
      <div className="leads-table__toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 className="leads-table__title">Leads Registry</h3>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
            }}
          >
            {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
          </span>
        </div>

        {/* Search & Actions Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-dimmed)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="leads-table__search"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="leads-table__call-select"
            style={{ width: 'auto', minWidth: '135px' }}
            title="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Platform Filter Dropdown */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="leads-table__call-select"
            style={{ width: 'auto', minWidth: '145px' }}
            title="Filter by platform"
          >
            <option value="all">All Platforms</option>
            {platformOptions.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>

          {/* Assignment Filter Dropdown */}
          <select
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            className="leads-table__call-select"
            style={{ width: 'auto', minWidth: '150px' }}
            title="Filter by assignment status"
          >
            <option value="all">All Assignments</option>
            <option value="assigned">Assigned Leads</option>
            <option value="unassigned">Unassigned Leads</option>
          </select>

          <Button
            variant="secondary"
            onClick={() => setSortOrder((prev) => (prev === 'oldest' ? 'newest' : 'oldest'))}
            title="Toggle sort order (Oldest / Newest)"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowUpDown size={15} />
            {sortOrder === 'oldest' ? 'Oldest First' : 'Newest First'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportExcel}
            title="Export leads to Excel spreadsheet"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <DownloadCloud size={16} /> Export Excel
          </Button>

          {!hideImportExcel && (
            <Button variant="primary" onClick={triggerFileInput} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={16} /> Import Excel
            </Button>
          )}

          {selectedLeadIds.length > 0 && (
            <>
              {employees.length > 0 && (
                <select
                  className="leads-table__call-select"
                  onChange={handleBulkAssign}
                  defaultValue=""
                  title="Assign selected leads to employee"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  <option value="" disabled>
                    Bulk Assign ({selectedLeadIds.length})...
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      Assign to {emp.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                className="leads-table__call-select"
                onChange={handleBulkStatusChange}
                defaultValue=""
                title="Change status for selected leads"
                style={{ background: 'var(--color-surface-elevated)', fontWeight: 600 }}
              >
                <option value="" disabled>
                  Bulk Status ({selectedLeadIds.length})...
                </option>
                <option value="New">Move to New</option>
                <option value="Contacted">Move to Contacted</option>
                <option value="Qualified">Move to Qualified</option>
                <option value="Won">Move to Won</option>
                <option value="Lost">Move to Lost</option>
              </select>

              <Button
                variant="danger"
                onClick={handleDeleteSelected}
                title="Delete selected leads"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Trash2 size={16} /> Delete Selected ({selectedLeadIds.length})
              </Button>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportExcel}
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
        />
      </div>

      {filteredLeads.length === 0 ? (
        <div className="leads-table__empty">
          <div className="leads-table__empty-icon"><Inbox size={36} color="var(--color-text-dimmed)" /></div>
          <div className="leads-table__empty-text">No leads found</div>
        </div>
      ) : (
        <table className="leads-table">
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  className="leads-table__checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  title="Select / Deselect All"
                />
              </th>
              <th>Platform</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Assigned to</th>
              <th>Status</th>
              <th>Days Remaining</th>
              <th>Call Attempts</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const { rowClass, statusText } = getExpiryDetails(lead.createdAt);
              return (
                <tr key={lead.id} className={rowClass}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="leads-table__checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={() => handleRowSelectToggle(lead.id)}
                      title={`Select ${lead.name}`}
                    />
                  </td>
                  <td className="leads-table__secondary" title={lead.platform}>{lead.platform || '—'}</td>
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
                        onClick={() => handleCallClick(lead.id)}
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="leads-table__secondary" title={lead.location}>{lead.location || '—'}</td>
                  <td title={getAssigneeDisplay(lead.assignedToRaw)}>
                    {showAssignAction ? (
                      <select
                        value={
                          employees.find(
                            (e) =>
                              e.id === lead.assignedToRaw ||
                              e.name === lead.assignedToRaw ||
                              (lead.assignedTo && e.name === lead.assignedTo)
                          )?.id || ''
                        }
                        onChange={async (e) => {
                          const val = e.target.value;
                          const selectedEmp = employees.find((emp) => emp.id === val);
                          const newName = selectedEmp ? selectedEmp.name : 'Unassigned';
                          setLeads((prev) =>
                            prev.map((l) =>
                              l.id === lead.id
                                ? { ...l, assignedTo: newName, assignedToRaw: val || null }
                                : l
                            )
                          );
                          if (onAssignLead) {
                            await onAssignLead(lead.id, val || null);
                          }
                        }}
                        className="leads-table__assign-select"
                        title={`Assign ${lead.name} to employee`}
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="leads-table__assigned">
                        {getAssigneeDisplay(lead.assignedToRaw)}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      value={lead.status || 'New'}
                      onChange={(e) => handleStatusChangeLocal(lead.id, e.target.value)}
                      className="leads-table__call-select"
                      style={{
                        fontWeight: '600',
                        color:
                          lead.status === 'Won'
                            ? 'var(--color-success)'
                            : lead.status === 'Lost'
                            ? 'var(--color-danger)'
                            : lead.status === 'Qualified'
                            ? '#8b5cf6'
                            : lead.status === 'Contacted'
                            ? 'var(--color-info)'
                            : 'var(--color-primary)',
                      }}
                      title={`Change status for ${lead.name}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
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
                  <td className="leads-table__secondary leads-table__notes" style={{ minWidth: '180px' }}>
                    <div
                      onClick={() => handleOpenNotepad(lead)}
                      title="Click to open Popup Notepad"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '0.35rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.825rem', color: 'var(--color-text)' }}>
                        {lead.notes || '—'}
                      </span>
                      <Notebook size={14} style={{ opacity: 0.85, flexShrink: 0, marginLeft: '0.4rem', color: 'var(--color-primary)' }} />
                    </div>
                  </td>
                  <td>
                    <div className="leads-table__actions" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {lead.phone && lead.phone !== '—' ? (
                        <>
                          <a
                            href={`tel:${cleanPhoneNumber(lead.phone)}`}
                            className="btn leads-table__call-btn leads-table__icon-btn"
                            title="Call Lead (Increments Call Attempts)"
                            onClick={() => handleCallClick(lead.id)}
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
                      {currentUserRole === 'employee' && (
                        <Button
                          variant="secondary"
                          className="leads-table__icon-btn"
                          onClick={() => handleOpenSwapModal(lead)}
                          title="Swap / Reassign Lead to another employee"
                          style={{ color: 'var(--color-primary)', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                        >
                          <ArrowRightLeft size={16} />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="leads-table__icon-btn"
                        onClick={() => onEditClick && onEditClick(lead)}
                        title="Edit Lead Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </Button>
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

      {/* Popup Notepad Modal */}
      <NotepadModal
        isOpen={!!activeNotepadLead}
        onClose={() => setActiveNotepadLead(null)}
        lead={activeNotepadLead}
        onSave={handleSaveNotepad}
        onAddActivity={onAddActivity}
      />

      {/* Swap Lead Modal */}
      <SwapLeadModal
        isOpen={swapLeadModalOpen}
        onClose={() => {
          setSwapLeadModalOpen(false);
          setLeadToSwap(null);
        }}
        lead={leadToSwap}
        employees={employees}
        currentUserId={user?.id}
        onSwap={handleConfirmSwap}
      />
    </div>
  );
}
