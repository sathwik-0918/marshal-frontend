const MOCK_EVENTS = {
  'vbit-fest-2026': {
    id: 'vbit-fest-2026',
    name: 'VBIT Cultural Fest 2026',
    dayLabel: 'Day 6 of 10',
    location: 'VBIT Campus, Hyderabad',
    visibility: 'public',
    accessCode: null,
    viewerIsMember: true,
  },
  'robotics-core-sync': {
    id: 'robotics-core-sync',
    name: 'Robotics Club — Core Team Sync',
    dayLabel: 'Weekly',
    location: 'Lab 3',
    visibility: 'private',
    accessCode: 'RBT-4X92',
    viewerIsMember: false,
  },
};

export function generateMockEvent(eventId = 'vbit-fest-2026') {
  const base = MOCK_EVENTS[eventId] ?? MOCK_EVENTS['vbit-fest-2026'];
  const now = Date.now();
  const min = 60 * 1000;

  return {
    ...base,
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