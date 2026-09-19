import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import Button from '../primitives/Button';
import { useApi } from '../../hooks/useApi';

export default function ChatPanel({ scheduleId, onClose }) {
  const apiFetch = useApi();
  const [messages, setMessages] = useState([
    { role: 'agent', text: "What's going on? Tell me about a delay, conflict, or anything that needs to change." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const result = await apiFetch(`/api/schedules/${scheduleId}/report-problem`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });

      if (result.needsClarification) {
        setMessages((prev) => [...prev, { role: 'agent', text: result.question }]);
      } else {
        setMessages((prev) => [...prev, { role: 'agent', proposal: result.proposal }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'agent', text: `Something went wrong: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Ask MARSHAL</h2>
        <button onClick={onClose} aria-label="Close chat" className="text-mist hover:text-chalk">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
        {sending && <p className="text-xs text-mist">MARSHAL is thinking...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. we'll be 20 minutes late"
          className="flex-1 rounded-sm border border-border bg-panel-raised px-3 py-2 text-sm"
        />
        <Button type="submit" variant="primary" size="sm" disabled={sending}>
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
}

function ChatMessage({ message }) {
  if (message.proposal) {
    const p = message.proposal;
    return (
      <div className="rounded-md border border-amber/40 bg-panel-raised p-3 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium">Proposal</span>
          <span className="text-xs text-mist">{p.riskTier} risk · pending approval</span>
        </div>
        <ul className="space-y-2">
          {p.options.map((opt, i) => (
            <li key={i} className="rounded-sm bg-ink/40 p-2">
              <p>{opt.description}</p>
              {opt.mlContext?.conflictDetected && (
                <p className="mt-1 text-xs text-critical">Checked against the schedule — this creates a conflict</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const isUser = message.role === 'user';
  return (
    <div className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${isUser ? 'ml-auto bg-amber text-ink' : 'bg-panel-raised text-chalk'}`}>
      {message.text}
    </div>
  );
}