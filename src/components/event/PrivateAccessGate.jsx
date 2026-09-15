import { useState } from 'react';
import { Lock } from 'lucide-react';
import Panel from '../primitives/Panel';
import Button from '../primitives/Button';

export default function PrivateAccessGate({ onSubmitCode }) {
  const [code, setCode] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <Panel className="w-full max-w-sm text-center">
        <Lock className="mx-auto mb-3 text-mist" size={24} />
        <h2 className="text-lg font-semibold">This schedule is private</h2>
        <p className="mt-1 text-sm text-mist">
          Ask the organizer for an access code, or sign in if you're already a member.
        </p>
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitCode(code.trim());
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            className="rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm text-center tracking-wide font-mono"
          />
          <Button type="submit" variant="primary">Join event</Button>
        </form>
      </Panel>
    </div>
  );
}