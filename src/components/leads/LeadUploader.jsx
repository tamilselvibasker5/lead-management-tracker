import { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import * as api from '../../services/api';
import './LeadUploader.css';

/* ═══════════════════════════════════════════════════════════════════
   HEADER MAPPING
   ───────────────────────────────────────────────────────────────────
   Maps common Excel column headers to the database field names.
   Add more entries here as needed for your use case.
   ═══════════════════════════════════════════════════════════════════ */
const DEFAULT_COLUMNS = ['Source', 'Name', 'Email', 'Phone', 'Location', 'Assigned to', 'Notes'];

const HEADER_MAP = {
  // Excel header (lowercased & trimmed) → Default column name
  'source': 'Source',
  'lead source': 'Source',
  'campaign': 'Source',
  'campaign_name': 'Source',
  'campaign name': 'Source',
  'ad name': 'Source',
  'platform': 'Source',
  'medium': 'Source',
  'source/medium': 'Source',

  'name': 'Name',
  'lead name': 'Name',
  'full name': 'Name',
  'contact name': 'Name',
  'customer name': 'Name',
  'client name': 'Name',
  'first name': 'Name',
  'first_name': 'Name',
  'student name': 'Name',

  'email': 'Email',
  'email address': 'Email',
  'e-mail': 'Email',
  'mail': 'Email',
  'email id': 'Email',
  'mail id': 'Email',

  'phone': 'Phone',
  'phone number': 'Phone',
  'mobile': 'Phone',
  'mobile number': 'Phone',
  'contact': 'Phone',
  'contact number': 'Phone',
  'contact no': 'Phone',
  'ph': 'Phone',
  'ph number': 'Phone',
  'ph no': 'Phone',
  'whatsapp': 'Phone',
  'whatsapp number': 'Phone',

  'location': 'Location',
  'city': 'Location',
  'state': 'Location',
  'country': 'Location',
  'address': 'Location',
  'region': 'Location',

  'assigned to': 'Assigned to',
  'assignee': 'Assigned to',
  'owner': 'Assigned to',
  'agent': 'Assigned to',

  'notes': 'Notes',
  'remark': 'Notes',
  'remarks': 'Notes',
  'comments': 'Notes',
};

/** Accepted file extensions. */
const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * Clean and normalise a single header string.
 * @param {string} raw - The raw Excel column header.
 * @returns {string} The mapped database field name, or the original if no mapping exists.
 */
function mapHeader(raw) {
  const key = String(raw).trim().toLowerCase();

  // 1. Exact match first
  if (HEADER_MAP[key]) return HEADER_MAP[key];

  // 2. Smart substring fallback
  if (key.includes('email') || key.includes('mail')) return 'Email';
  if (key.includes('phone') || key.includes('ph') || key.includes('mobile') || key.includes('contact') || key.includes('whatsapp') || key.includes('number') || key.includes('cell')) return 'Phone';
  if (key.includes('city') || key.includes('location') || key.includes('region') || key.includes('address') || key.includes('state')) return 'Location';
  if (key.includes('source') || key.includes('campaign') || key.includes('platform') || key.includes('medium') || key.includes('ad') || key.includes('channel')) return 'Source';
  if (key.includes('name') || key.includes('candidate') || key.includes('student') || key.includes('client') || key.includes('customer') || key.includes('person')) return 'Name';
  if (key.includes('note') || key.includes('remark') || key.includes('comment') || key.includes('desc') || key.includes('detail') || key.includes('feedback')) return 'Notes';
  if (key.includes('assign') || key.includes('owner') || key.includes('agent') || key.includes('rep') || key.includes('caller') || key.includes('executive') || key.includes('employee') || key.includes('staff') || key.includes('counselor') || key.includes('user') || key.includes('handled')) return 'Assigned to';

  return key;
}

/**
 * Parse a workbook's first sheet into an array of cleaned lead objects.
 * @param {XLSX.WorkBook} workbook
 * @returns {{ headers: string[], mappedHeaders: string[], rows: object[] }}
 */
function parseWorkbook(workbook) {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('The workbook has no sheets.');

  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-arrays to get raw headers
  const rawAoA = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rawAoA.length < 2) {
    throw new Error('The sheet must have at least a header row and one data row.');
  }

  const rawHeaders = rawAoA[0].map(String);
  const mappedHeaders = rawHeaders.map(mapHeader);

  // Convert to array-of-objects using the mapped headers
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  const rows = jsonData.map((row) => {
    const cleaned = {};

    // 1. Initialize all default columns to empty string so they always exist
    DEFAULT_COLUMNS.forEach((col) => {
      cleaned[col] = '';
    });

    // 2. Map only the allowed columns from Excel
    for (const [key, value] of Object.entries(row)) {
      const mappedKey = mapHeader(key);
      if (DEFAULT_COLUMNS.includes(mappedKey)) {
        cleaned[mappedKey] = typeof value === 'string' ? value.trim() : value;
      }
    }

    return cleaned;
  });

  return { headers: rawHeaders, mappedHeaders, rows };
}

/**
 * Format bytes into a human-readable string.
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ═══════════════════════════════════════════════════════
   LeadUploader Component
   ═══════════════════════════════════════════════════════ */

/**
 * Excel / CSV bulk-import component.
 *
 * 1. Admin uploads an Excel file (drag-drop or click).
 * 2. The file is parsed client-side using the `xlsx` library.
 * 3. A preview table lets the admin verify the data.
 * 4. "Confirm Import" sends the JSON payload to the backend.
 *
 * @param {{ onImportComplete?: () => void }} props
 */
export default function LeadUploader({ onImportComplete }) {
  /* ── State ── */
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null); // { headers, mappedHeaders, rows }
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [newColName, setNewColName] = useState('');
  const [newColValue, setNewColValue] = useState('');
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState('');

  const fileInputRef = useRef(null);

  /* ── Validate file type ── */
  const validateFile = (f) => {
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      throw new Error(
        `Invalid file type "${ext}". Accepted formats: ${ACCEPTED_EXTENSIONS.join(', ')}`
      );
    }
    if (f.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10 MB limit.');
    }
  };

  /* ── Parse the uploaded file ── */
  const handleFile = useCallback(async (selectedFile) => {
    setError('');
    setSuccess('');
    setParsedData(null);

    try {
      validateFile(selectedFile);
      setFile(selectedFile);
      setParsing(true);

      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const result = parseWorkbook(workbook);

      if (result.rows.length === 0) {
        throw new Error('No data rows found in the file.');
      }

      setParsedData(result);
    } catch (err) {
      setError(err.message || 'Failed to parse file.');
      setFile(null);
    } finally {
      setParsing(false);
    }
  }, []);

  /* ── File input change ── */
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // Reset the input so re-uploading the same file triggers onChange
    e.target.value = '';
  };

  /* ── Drag & drop handlers ── */
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  /* ── Remove file ── */
  const handleRemoveFile = () => {
    setFile(null);
    setParsedData(null);
    setError('');
    setSuccess('');
    setNewColName('');
    setNewColValue('');
  };

  /* ── Add custom column ── */
  const handleAddColumn = (e) => {
    e.preventDefault();
    if (!newColName.trim() || !parsedData) return;
    const key = newColName.trim();

    // Add to parsedData
    const updatedRows = parsedData.rows.map((row) => ({
      ...row,
      [key]: newColValue,
    }));

    setParsedData({
      ...parsedData,
      rows: updatedRows,
    });

    setNewColName('');
    setNewColValue('');
  };

  /* ── Delete custom column ── */
  const handleDeleteColumn = (e) => {
    e.preventDefault();
    if (!columnToDelete || !parsedData) return;

    const updatedRows = parsedData.rows.map((row) => {
      const newRow = { ...row };
      delete newRow[columnToDelete];
      return newRow;
    });

    setParsedData({
      ...parsedData,
      rows: updatedRows,
    });

    setColumnToDelete('');
    setIsDeleteColumnModalOpen(false);
  };

  /* ── Confirm import → send to backend ── */
  const handleConfirmImport = async () => {
    if (!parsedData?.rows?.length) return;

    try {
      setImporting(true);
      setError('');
      setSuccess('');

      /*
       * JSON Payload Structure sent to the backend:
       * ─────────────────────────────────────────────
       * {
       *   "leads": [
       *     {
       *       "name": "Vikram Singh",
       *       "email": "vikram@example.com",
       *       "phone": "+91 98765 43210",
       *       "status": "New",
       *       "assignedTo": ""
       *     },
       *     ...
       *   ]
       * }
       *
       *   ]
       * }
       */
      const payload = { leads: parsedData.rows };

      await api.bulkImportLeads(payload);

      setSuccess(
        `Successfully imported ${parsedData.rows.length} lead${parsedData.rows.length !== 1 ? 's' : ''}!`
      );
      setParsedData(null);
      setFile(null);
      onImportComplete?.();
    } catch (err) {
      setError(err.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  /* ── Build the mapping display (Excel header → DB field) ── */
  const mappingPairs = parsedData
    ? parsedData.headers
      .map((h, i) => ({
        from: h,
        to: parsedData.mappedHeaders[i],
      }))
      .filter((pair) => DEFAULT_COLUMNS.includes(pair.to))
    : [];

  /* ── Dynamic columns for preview ── */
  const activeColumns = parsedData && parsedData.rows.length > 0
    ? Object.keys(parsedData.rows[0])
    : [];

  /* ── Render ── */
  return (
    <div className="lead-uploader">
      {/* ── Drop zone ── */}
      {!parsedData && !parsing && (
        <div
          className={`lead-uploader__dropzone${dragOver ? ' lead-uploader__dropzone--dragover' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="lead-uploader__file-input"
            accept=".xlsx,.xls,.csv"
            onChange={onFileChange}
            id="lead-file-upload"
          />
          <span className="lead-uploader__dropzone-icon">📤</span>
          <div className="lead-uploader__dropzone-title">
            Drag & drop your Excel file here
          </div>
          <div className="lead-uploader__dropzone-subtitle">
            or <strong>click to browse</strong> — supports .xlsx, .xls, .csv (max 10 MB)
          </div>
        </div>
      )}

      {/* ── Parsing spinner ── */}
      {parsing && <Spinner />}

      {/* ── Error ── */}
      {error && (
        <div className="lead-uploader__error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── Success ── */}
      {success && (
        <div className="lead-uploader__success">
          <span>✅</span> {success}
        </div>
      )}

      {/* ── File info ── */}
      {file && parsedData && (
        <div className="lead-uploader__file-info">
          <div className="lead-uploader__file-details">
            <div className="lead-uploader__file-icon">📄</div>
            <div>
              <div className="lead-uploader__file-name">{file.name}</div>
              <div className="lead-uploader__file-meta">
                {formatFileSize(file.size)} • {parsedData.rows.length} rows
                detected
              </div>
            </div>
          </div>
          <button
            className="lead-uploader__file-remove"
            onClick={handleRemoveFile}
            title="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Column mapping ── */}
      {parsedData && mappingPairs.length > 0 && (
        <div className="lead-uploader__mapping">
          <div className="lead-uploader__mapping-title">
            Column Mapping (Excel → Database)
          </div>
          <div className="lead-uploader__mapping-grid">
            {mappingPairs.map((pair, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <span className="lead-uploader__mapping-from">
                  {pair.from}
                </span>
                <span className="lead-uploader__mapping-arrow">→</span>
                <span className="lead-uploader__mapping-to">{pair.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preview table ── */}
      {parsedData && parsedData.rows.length > 0 && (
        <>
          <div className="lead-uploader__preview-header" style={{ marginTop: '0.5rem' }}>
            <div>
              <h3 className="lead-uploader__preview-title">Data Preview</h3>
              <span className="lead-uploader__preview-count">
                Showing {Math.min(parsedData.rows.length, 50)} of{' '}
                {parsedData.rows.length} rows
              </span>
            </div>
            <div>
              <Button variant="ghost" onClick={() => setIsDeleteColumnModalOpen(true)} style={{ marginRight: '0.5rem', color: 'var(--color-error)' }}>
                - Delete Column
              </Button>
              <Button variant="secondary" onClick={() => setIsAddColumnModalOpen(true)}>
                + Add Column
              </Button>
            </div>
          </div>

          <div className="lead-uploader__preview-table-wrap">
            <table className="lead-uploader__preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  {activeColumns.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    <td className="cell--row-num">{idx + 1}</td>
                    {activeColumns.map((field) => (
                      <td
                        key={field}
                        className={
                          !row[field] ? 'cell--empty' : ''
                        }
                      >
                        {row[field] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Actions ── */}
          <div className="lead-uploader__actions">
            <Button variant="ghost" onClick={handleRemoveFile}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={importing}
              onClick={handleConfirmImport}
            >
              ✓ Confirm Import ({parsedData.rows.length} leads)
            </Button>
          </div>
        </>
      )}

      {/* ── Add Column Modal ── */}
      <Modal
        isOpen={isAddColumnModalOpen}
        onClose={() => {
          setIsAddColumnModalOpen(false);
          setNewColName('');
          setNewColValue('');
        }}
        title="Add Custom Column"
      >
        <form
          onSubmit={(e) => {
            handleAddColumn(e);
            setIsAddColumnModalOpen(false);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Column Name
            </label>
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="e.g. source"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Default Value (optional)
            </label>
            <input
              type="text"
              value={newColValue}
              onChange={(e) => setNewColValue(e.target.value)}
              placeholder="e.g. Website"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsAddColumnModalOpen(false);
                setNewColName('');
                setNewColValue('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!newColName.trim()}>
              Add Column
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Column Modal ── */}
      <Modal
        isOpen={isDeleteColumnModalOpen}
        onClose={() => {
          setIsDeleteColumnModalOpen(false);
          setColumnToDelete('');
        }}
        title="Delete Column"
      >
        <form
          onSubmit={handleDeleteColumn}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
              Select Column to Delete
            </label>
            <select
              value={columnToDelete}
              onChange={(e) => setColumnToDelete(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              <option value="" disabled>Select a column...</option>
              {activeColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setIsDeleteColumnModalOpen(false);
                setColumnToDelete('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!columnToDelete} style={{ background: 'var(--color-error)' }}>
              Delete Column
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
