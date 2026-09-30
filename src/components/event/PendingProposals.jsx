import { useState, useEffect } from 'react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';
import ProposalOptionCard from './ProposalOptionCard';

const RISK_COLORS = { low: 'text-success bg-success/10', medium: 'text-warning bg-warning/10', high: 'text-critical bg-critical/10' };

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
      alert(err.message);
      // An out-of-date proposal can never be approved, so drop it from the list.
      if (err.status === 409) setProposals((prev) => prev.filter((p) => p._id !== proposalId));
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-mist">Reported: "{p.requestText}"</p>
              <span className={`text-xs rounded-sm px-2 py-0.5 ${RISK_COLORS[p.riskTier] || RISK_COLORS.medium}`}>{p.riskTier} risk</span>
            </div>
            <ul className="mt-2 space-y-2">
              {p.options.map((opt) => (
                <ProposalOptionCard
                  key={opt._id}
                  option={opt}
                  action={canDecide && (
                    <Button size="sm" variant="primary" disabled={decidingId === p._id} onClick={() => decide(p._id, 'approve', opt._id)}>
                      Approve this option
                    </Button>
                  )}
                />
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