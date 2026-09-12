/**
 * Realistic demo content, not generic placeholder text. Timestamps
 * are relative to whenever this loads, not fixed calendar dates, so
 * "what's live right now" is genuinely true whenever you open this —
 * today, or three weeks from now during the actual review.
 */
export function generateMockEvent() {
  const now = Date.now();
  const min = 60 * 1000;

  return {
    name: 'VBIT Cultural Fest 2026',
    dayLabel: 'Day 6 of 10',
    location: 'VBIT Campus, Hyderabad',
    status: 'live',
    activities: [
      { id: 'a1', title: 'Dance Competition', venue: 'Main Stage', scheduledStart: new Date(now - 20 * min).toISOString(), durationMinutes: 90, status: 'scheduled', isMine: false },
      { id: 'a2', title: 'Robotics Workshop', venue: 'Seminar Hall', scheduledStart: new Date(now - 10 * min).toISOString(), durationMinutes: 60, status: 'scheduled', isMine: true },
      { id: 'a3', title: 'Opening Remarks', venue: 'Main Stage', scheduledStart: new Date(now - 200 * min).toISOString(), durationMinutes: 30, status: 'completed', isMine: false },
      { id: 'a4', title: 'Poster Review', venue: 'Room A', scheduledStart: new Date(now + 40 * min).toISOString(), durationMinutes: 45, status: 'scheduled', isMine: true },
      { id: 'a5', title: 'Live Band Performance', venue: 'Main Stage', scheduledStart: new Date(now + 120 * min).toISOString(), durationMinutes: 90, status: 'scheduled', isMine: false },
      { id: 'a6', title: 'Coding Contest Finals', venue: 'Computer Lab', scheduledStart: new Date(now + 180 * min).toISOString(), durationMinutes: 120, status: 'scheduled', isMine: false },
    ],
  };
}