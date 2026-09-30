import { useState } from 'react';
import { X } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';
import CsvPreviewRow, { validateRowClientSide } from './CsvPreviewRow';

export default function BulkImportModal({ scheduleId, onClose, onImported }) {
  const apiFetch = useApi();
  const [step, setStep] = useState('select'); // 'select' | 'preview' | 'result'
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const validCount = rows.filter((r) => validateRowClientSide(r).length === 0).length;

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = await window.Clerk?.session?.getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/schedules/${scheduleId}/activities/bulk-import/preview`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preview failed');
      setRows(data.rows);
      setStep('preview');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/schedules/${scheduleId}/activities/bulk-import/confirm`, {
        method: 'POST',
        body: JSON.stringify({ rows }),
      });
      setResult(data);
      setStep('result');
      onImported?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Panel className="w-full max-w-2xl relative max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-mist hover:text-chalk"><X size={18} /></button>

        {step === 'select' && (
          <>
            <h2 className="text-lg font-semibold mb-2">Bulk import activities</h2>
            <p className="text-xs text-mist mb-4">
              CSV columns: title, activityType, scheduledStart, durationMinutes, venue, description, participantEmails (semicolon-separated), requiredResources (semicolon-separated)
            </p>
            <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="text-sm mb-3" />
            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <Button variant="primary" onClick={handlePreview} disabled={!file || loading}>
              {loading ? 'Reading file...' : 'Preview'}
            </Button>
          </>
        )}

        {step === 'preview' && (
          <>
            <h2 className="text-lg font-semibold mb-1">Review before importing</h2>
            <p className="text-xs text-mist mb-3">
              {validCount} of {rows.length} rows ready. Edit a field directly, or remove a row you don't want.
            </p>
            <div className="space-y-2 mb-4">
              {rows.map((row, i) => (
                <CsvPreviewRow
                  key={i}
                  row={row}
                  onChange={(updated) => setRows((prev) => prev.map((r, idx) => (idx === i ? updated : r)))}
                  onRemove={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
            {error && <p className="text-sm text-critical mb-3">{error}</p>}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleConfirm} disabled={loading || validCount === 0}>
                {loading ? 'Importing...' : `Import ${validCount} activit${validCount === 1 ? 'y' : 'ies'}`}
              </Button>
              <Button variant="secondary" onClick={() => setStep('select')} disabled={loading}>Start over</Button>
            </div>
          </>
        )}

        {step === 'result' && result && (
          <>
            <h2 className="text-lg font-semibold mb-3">Import complete</h2>
            <div className="text-sm space-y-1 mb-4 rounded-sm bg-panel-raised p-3">
              <p>{result.activitiesCreated} activities created</p>
              <p>{result.stakeholdersLinked} participants linked directly</p>
              <p>{result.pendingInvitesCreated} pending invites created</p>
              {result.rowErrors.length > 0 && (
                <p className="text-warning">{result.rowErrors.length} rows skipped: {result.rowErrors.join('; ')}</p>
              )}
            </div>
            <Button variant="primary" onClick={onClose}>Done</Button>
          </>
        )}
      </Panel>
    </div>
  );
}