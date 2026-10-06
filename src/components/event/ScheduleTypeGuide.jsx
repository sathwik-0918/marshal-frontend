import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { SCHEDULE_TYPE_GUIDES, buildAiInstructions, downloadCsvTemplate } from '../../utils/scheduleTypeGuides';

export default function ScheduleTypeGuide() {
  const [selected, setSelected] = useState(SCHEDULE_TYPE_GUIDES[0]);
  const [copied, setCopied] = useState(false);
  const instructions = buildAiInstructions(selected.shape, selected.domainHint);

  async function handleCopy() {
    await navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mb-4 rounded-md border border-border bg-panel-raised p-3">
      <p className="mb-2 text-xs text-mist">What kind of schedule is this?</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SCHEDULE_TYPE_GUIDES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t)}
            className={`rounded-sm px-2.5 py-1 text-xs ${selected.id === t.id ? 'bg-amber text-ink' : 'bg-panel text-mist hover:text-chalk'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-chalk hover:bg-panel">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy AI instructions'}
        </button>
        <button onClick={() => downloadCsvTemplate(selected.shape, selected.label)} className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs text-chalk hover:bg-panel">
          <Download size={13} /> Download CSV template
        </button>
      </div>
      <p className="mt-2 text-[11px] text-mist">
        Paste the copied instructions into ChatGPT, Gemini, or Claude along with your source info to generate a ready-to-upload document. Or download the template and fill it directly.
      </p>
    </div>
  );
}