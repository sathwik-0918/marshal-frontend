import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';

const ROLES = ['viewer', 'stakeholder', 'manager', 'owner'];

export default function PeopleModal({ scheduleId, viewerRole, onClose }) {
  const apiFetch = useApi();
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('stakeholder');
  const [error, setError] = useState(null);
  const canManage = viewerRole === 'owner' || viewerRole === 'manager';

  function refresh() {
    setLoading(true);
    apiFetch(`/api/schedules/${scheduleId}/members`).then((data) => {
      setMembers(data.members);
      setPending(data.pending);
      setLoading(false);
    });
  }

  useEffect(refresh, [scheduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/members`, { method: 'POST', body: JSON.stringify({ email, role }) });
      setEmail('');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError(null);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(userId, name) {
    if (!window.confirm(`Remove ${name} from this schedule?`)) return;
    setError(null);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/members/${userId}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <Panel className="w-full max-w-md relative max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-mist hover:text-chalk"><X size={18} /></button>
        <h2 className="text-lg font-semibold mb-4">People</h2>

        {canManage && (
          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-sm border border-border bg-panel-raised px-2 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button type="submit" variant="primary" size="sm">Add</Button>
          </form>
        )}
        {error && <p className="text-sm text-critical mb-3">{error}</p>}

        <h3 className="text-xs text-mist mb-2">{loading ? 'Loading members...' : `Registered (${members.length})`}</h3>
        <ul className="space-y-1 mb-4">
          {members.map((m) => (
            <li key={m.userId._id} className="flex items-center justify-between text-sm py-1 gap-2">
              <span className="truncate">{m.userId.name}</span>
              {canManage ? (
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.userId._id, e.target.value)}
                    className="rounded-sm border border-border bg-panel-raised px-1.5 py-0.5 text-xs"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => handleRemove(m.userId._id, m.userId.name)} className="text-xs text-critical hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <span className="text-mist">{m.role}</span>
              )}
            </li>
          ))}
        </ul>

        {pending.length > 0 && (
          <>
            <h3 className="text-xs text-mist mb-2">Pending ({pending.length})</h3>
            <ul className="space-y-1">
              {pending.map((p) => (
                <li key={p._id} className="flex justify-between text-sm py-1 text-mist">
                  <span>{p.email}</span><span>{p.role} · awaiting sign-in</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}