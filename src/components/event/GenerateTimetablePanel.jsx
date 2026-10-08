import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';
import TimetableGrid from './TimetableGrid';
import FullscreenOverlay from './FullscreenOverlay';
import { useApi } from '../../hooks/useApi';

const OBJECTIVE_LABELS = {
  balanced: 'Balanced - spreads each subject across the week',
  front_load_special: 'Labs/special sessions earlier in the week',
  back_load_special: 'Labs/special sessions later in the week',
};

function toGridShape(entries) {
  return entries.map((e, i) => ({ ...e, _id: `preview-${i}`, startTime: e.start_time, endTime: e.end_time }));
}

export default function GenerateTimetablePanel({ form, onCreated }) {
  const apiFetch = useApi();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spec, setSpec] = useState(null);
  const [options, setOptions] = useState(null);
  const [assumptions, setAssumptions] = useState([]);
  const [selected, setSelected] = useState(0);
  const [refined, setRefined] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [refining, setRefining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  const activeEntries = refined ? refined.reference_entries : options?.[selected]?.reference_entries;
  const changedSubjects = refined?.changed_subjects || [];

  async function handleGenerate() {
    if (!text.trim()) return;
    setLoading(true); setError(null); setOptions(null); setRefined(null); setExplanation(null);
    try {
      const data = await apiFetch('/api/schedules/generate/preview', { method: 'POST', body: JSON.stringify({ requirementText: text }) });
      if (!data.feasible) { setError(data.message); }
      else { setOptions(data.options); setSpec(data.spec); setAssumptions(data.assumptions || []); setSelected(0); }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectOption(i) {
    setSelected(i); setRefined(null); setFeedback(''); setExplanation(null);
  }

  async function handleRefine() {
    if (!feedback.trim() || !activeEntries) return;
    setRefining(true); setError(null); setExplanation(null);
    try {
      const data = await apiFetch('/api/schedules/generate/refine', {
        method: 'POST',
        body: JSON.stringify({ spec, rejectedReferenceEntries: activeEntries, feedbackText: feedback, objectiveMode: options[selected].mode }),
      });
      if (!data.feasible) { setError(data.message); } else { setRefined(data); setFeedback(''); }
    } catch (err) {
      setError(err.message);
    } finally {
      setRefining(false);
    }
  }

  async function handleCellClick(gridEntry) {
    if (!spec || !activeEntries) return;
    const targetEntry = {
      title: gridEntry.title, entry_type: gridEntry.entry_type, weekday: gridEntry.weekday,
      start_time: gridEntry.startTime, end_time: gridEntry.endTime, venue: gridEntry.venue, metadata: gridEntry.metadata,
    };
    setExplaining(true);
    setExplanation({ subject: gridEntry.title, text: null });
    try {
      const data = await apiFetch('/api/schedules/generate/explain', {
        method: 'POST',
        body: JSON.stringify({ spec, referenceEntries: activeEntries, targetEntry, objectiveMode: refined ? 'refined' : options[selected].mode }),
      });
      setExplanation({ subject: gridEntry.title, text: data.explanation });
    } catch (err) {
      setExplanation({ subject: gridEntry.title, text: `Couldn't explain this: ${err.message}` });
    } finally {
      setExplaining(false);
    }
  }

  async function handleUseOption() {
    setCreating(true); setError(null);
    try {
      const created = await apiFetch('/api/schedules/generate/confirm', { method: 'POST', body: JSON.stringify({ ...form, specTitle: spec?.title, referenceEntries: activeEntries }) });
      onCreated(created.schedule._id);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  const previewBody = options && (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          {options.map((opt, i) => (
            <Button key={i} size="sm" variant={selected === i ? 'primary' : 'secondary'} onClick={() => selectOption(i)}>Option {i + 1}</Button>
          ))}
        </div>
        {!fullscreen && (
          <button onClick={() => setFullscreen(true)} aria-label="Expand to fullscreen" className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs text-mist hover:text-chalk hover:bg-panel-raised">
            <Maximize2 size={13} /> Expand
          </button>
        )}
      </div>

      <p className="mb-1 text-xs text-mist">{refined ? 'Refined based on your feedback' : OBJECTIVE_LABELS[options[selected].mode] || options[selected].mode}</p>
      {assumptions.length > 0 && !refined && <p className="mb-3 text-[11px] text-mist">Assumed (no cap stated): {assumptions.join(' · ')}</p>}
      {refined?.unresolved_feedback?.length > 0 && <p className="mb-3 text-[11px] text-warning">Couldn't apply: {refined.unresolved_feedback.join('; ')}</p>}
      {changedSubjects.length > 0 && <p className="mb-3 text-[11px] text-amber">Moved: {changedSubjects.join(', ')} - everything else stayed where it was</p>}

      <p className="mb-2 text-[11px] text-mist">Click any session to see why it's placed there.</p>
      <Panel><TimetableGrid entries={toGridShape(activeEntries)} onCellClick={handleCellClick} /></Panel>

      {explanation && (
        <div className="mt-3 rounded-sm border border-amber/40 bg-amber/10 p-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium">{explanation.subject}</span>
            <button onClick={() => setExplanation(null)} aria-label="Dismiss" className="text-mist hover:text-chalk">×</button>
          </div>
          <p className="text-xs text-mist">{explaining ? 'Thinking…' : explanation.text}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input className="flex-1 rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="e.g. Don't put ML and DAA on the same day; keep labs after lunch" />
        <Button variant="secondary" onClick={handleRefine} disabled={!feedback.trim() || refining}>{refining ? 'Refining…' : 'Refine'}</Button>
      </div>

      <Button variant="primary" className="mt-4" onClick={handleUseOption} disabled={creating}>{creating ? 'Creating…' : 'Use this timetable'}</Button>
    </div>
  );

  return (
    <div>
      <p className="text-xs text-mist mb-3">
        Describe what needs scheduling - subjects, how many times a week each, how long each one is, faculty,
        your period structure and lunch break. Be exact about weekly counts and durations; MARSHAL's solver
        handles the actual placement, not the LLM, so it won't guess a schedule that violates what you stated.
      </p>
      <textarea className="w-full rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-chalk mb-3" rows={8} value={text} onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Section A needs: ML x5, DAA x4 (Mrs. Adarana)... Section B needs: ML x5, CN x4 (Mrs. Parvathi, shared with Section A if applicable)... College starts 9:50, 7 periods of 50 min, lunch 1:10-1:50 after period 4." />
      {error && <p className="text-sm text-critical mb-3">{error}</p>}
      <Button variant="primary" onClick={handleGenerate} disabled={!text.trim() || loading}>{loading ? 'Solving… (several sections can take up to a minute)' : 'Generate options'}</Button>

      {options && !fullscreen && <div className="mt-5">{previewBody}</div>}
      {options && fullscreen && (
        <FullscreenOverlay title={spec?.title || 'Review timetable'} onClose={() => setFullscreen(false)}>{previewBody}</FullscreenOverlay>
      )}
    </div>
  );
}