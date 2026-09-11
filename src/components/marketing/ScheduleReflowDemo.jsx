import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * The hero's whole job: SHOW what MARSHAL does in five seconds,
 * instead of telling people with "AI-powered scheduling" copy.
 * A real disruption appears, the schedule visibly reflows.
 *
 * Respects reduced-motion: shows the resolved end-state instead
 * of auto-cycling if the user's system asks for it.
 */
export default function ScheduleReflowDemo() {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [stage, setStage] = useState(prefersReducedMotion ? 2 : 0);
  // 0 = normal · 1 = disruption arrives · 2 = resolved

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Chained on purpose: each step schedules the next one directly.
    // Depending on `stage` itself would make this effect's own
    // cleanup cancel later steps and restart the timeline early.
    let currentTimeout;
    const runCycle = () => {
      setStage(0);
      currentTimeout = setTimeout(() => {
        setStage(1);
        currentTimeout = setTimeout(() => {
          setStage(2);
          currentTimeout = setTimeout(runCycle, 3600);
        }, 1600);
      }, 1800);
    };

    runCycle();
    return () => clearTimeout(currentTimeout);
  }, [prefersReducedMotion]);

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-panel/80 backdrop-blur-md p-4 shadow-2xl">
      <div className="flex items-center justify-between rounded-sm bg-panel-raised px-3 py-2.5">
        <div>
          <p className="text-sm font-medium">Dance Competition</p>
          <p className="text-xs text-mist">
            {stage === 2 ? 'Seminar Hall' : 'Main Stage'} · 5:30 PM
          </p>
        </div>
        {stage === 2 && (
          <span className="text-[11px] font-medium text-success">Rescheduled</span>
        )}
      </div>

      <div className="mt-2 h-9 flex items-center">
        {stage === 1 && (
          <div className="flex items-center gap-2 text-xs text-warning">
            <AlertTriangle size={14} />
            Auditorium unavailable — MARSHAL is finding a slot
          </div>
        )}
        {stage === 2 && (
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle2 size={14} />
            Moved automatically, everyone affected notified
          </div>
        )}
      </div>
    </div>
  );
}