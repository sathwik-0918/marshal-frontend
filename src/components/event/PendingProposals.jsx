import { useState, useEffect } from 'react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';

export default function PendingProposals({ scheduleId, canDecide, onDecided }) {
  const apiFetch = useApi();
  const [proposals, setProposals] = useState([]);
  const [decidingId, setDecidingId] = useState(null);

  useEffect(() => {
    apiFetch(`/api/schedules/${scheduleId}/proposals?status=pending`).then(setProposals).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  async function decide(proposalId, decision, optionId) {
    setDecidingId(proposalId);
    try {
      await apiFetch(`/api/schedules/${scheduleId}/proposals/${proposalId}/decide`, {
        method: 'PATCH',
        body: JSON.stringify({ decision, optionId }),
      });
      setProposals((prev) => prev.filter((p) => p._id !== proposalId));
      onDecided?.();
    } catch (err) {
      alert(err.message); // a proper toast is a polish item for later, not this pass
    } finally {
      setDecidingId(null);
    }
  }

  if (proposals.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-mist">Pending proposals ({proposals.length})</h2>
      <div className="space-y-3">
        {proposals.map((p) => (
          <Panel key={p._id} emphasis>
            <p className="text-sm text-mist mb-2">"{p.requestText}"</p>
            <span className="text-xs text-mist">{p.riskTier} risk</span>
            <ul className="mt-2 space-y-2">
              {p.options.map((opt) => (
                <li key={opt._id} className="flex items-center justify-between rounded-sm bg-panel-raised p-2">
                  <div>
                    <p className="text-sm">{opt.description}</p>
                    {opt.mlContext?.conflictDetected && (
                      <p className="text-xs text-critical">Conflicts with another activity</p>
                    )}
                  </div>
                  {canDecide && (
                    <Button size="sm" variant="primary" disabled={decidingId === p._id} onClick={() => decide(p._id, 'approve', opt._id)}>
                      Approve
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {canDecide && (
              <Button size="sm" variant="ghost" className="mt-2" disabled={decidingId === p._id} onClick={() => decide(p._id, 'reject', null)}>
                Reject all
              </Button>
            )}
          </Panel>
        ))}
      </div>
    </section>
  );
}