export const SCHEDULE_TYPE_GUIDES = [
  { id: 'class_timetable', label: 'Class Timetable', shape: 'recurring', domainHint: 'a weekly college class timetable for one section' },
  { id: 'multi_section', label: 'Multi-Section Timetable', shape: 'recurring', domainHint: 'a weekly class timetable covering multiple sections - include the section in the title or metadata of every entry' },
  { id: 'exam_timetable', label: 'Exam Timetable', shape: 'activity', domainHint: 'an examination timetable, where each exam session (subject + date + session time) is one row' },
  { id: 'academic_calendar', label: 'Academic Calendar', shape: 'daterange', domainHint: 'an academic calendar listing semester phases as date ranges' },
  { id: 'crt_training', label: 'CRT / Training Program', shape: 'daterange', domainHint: 'a training or CRT schedule, where each row is a date range for one track or batch' },
  { id: 'hostel_menu', label: 'Hostel / Mess Menu', shape: 'recurring', domainHint: 'a weekly hostel menu, each entry one meal on one weekday, with food items in metadata as "menu: item1, item2"' },
  { id: 'sports_event', label: 'Sports / Event Schedule', shape: 'activity', domainHint: 'a sports fest or event schedule, each row one match, ceremony, or session' },
  { id: 'project_schedule', label: 'Project / Work Schedule', shape: 'activity', domainHint: 'a project or work schedule, each row one task or meeting' },
  { id: 'cultural_event', label: 'Cultural / College Events', shape: 'activity', domainHint: 'a college events calendar, each row one event' },
  { id: 'custom', label: 'Custom / Other', shape: 'activity', domainHint: 'a general schedule - use the activity format unless most entries repeat weekly with no fixed date, or describe a date range rather than one moment' },
];

export function buildAiInstructions(shape, domainHint) {
  const header = `You are generating a schedule document for an app called MARSHAL. This will be read by another AI, not a human - follow this format exactly rather than making it visually pretty. Do not rely on table position, color, bold text, or merged cells to convey meaning; every fact must be written out explicitly.\n\nThis document describes: ${domainHint}.\n\n`;
  const context = `At the very top, before any entries, include a "Context" section with: Organization/College name, Department (if any), Academic year or term (if any), Location. Use UNDEFINED for any you don't have.\n\n`;
  const undef = `If a field's real value isn't available, write exactly UNDEFINED - don't guess, don't leave blank, don't write "N/A" or "unknown".\n\n`;
  const dates = `Every date is exactly YYYY-MM-DD (e.g. 2026-08-24). Every time is 24-hour HH:MM (e.g. 09:50, 14:00). No other format.\n\n`;
  const blocks = {
    activity: `Format each entry exactly like this, one per schedulable event:\n\nActivity: <title>\nType: <short category, e.g. class, match, exam, meeting>\nDate: <YYYY-MM-DD>\nTime: <HH:MM>\nDurationMinutes: <number>\nVenue: <venue, or UNDEFINED>\nRequiredResources: <semicolon-separated people/resources this needs exclusively, e.g. "Professor Ravi; Lab 3", or UNDEFINED>\nParticipantEmails: <semicolon-separated emails, or UNDEFINED>\nDescription: <one line, or UNDEFINED>\n\nInclude EVERY event the source describes - do not summarize or skip any.`,
    recurring: `Format each entry exactly like this, one per weekly recurring slot:\n\nEntry: <title>\nWeekday: <Monday/Tuesday/.../Sunday>\nStartTime: <HH:MM, or UNDEFINED if there's no fixed clock time>\nEndTime: <HH:MM, or UNDEFINED>\nVenue: <venue, or UNDEFINED>\nMetadata: <semicolon-separated "label: value" pairs - e.g. "faculty: Mrs. Adarana; section: A; subject code: 22CS3111", or for a menu "menu: item1, item2, item3">\n\nInclude EVERY slot for EVERY day - do not skip or merge entries.`,
    daterange: `Format each entry exactly like this, one per date-range period:\n\nPeriod: <title>\nStartDate: <YYYY-MM-DD>\nEndDate: <YYYY-MM-DD>\nDescription: <one line, or UNDEFINED>\nMetadata: <semicolon-separated "label: value" pairs - e.g. "group: CSM-2; track: Technical", or UNDEFINED>\n\nInclude EVERY period described.\n\n also extract lunch in the same way as u do for all the classes no only luch like breaks or rest time or anything which takes time slots`,
  };
  const fileOutput = `\n\nProvide this as a downloadable file (.txt or .md) rather than only as chat text, if your interface supports it - so it can be uploaded directly without needing to be copied into a file first.`;
  const footer = `\n\nAt the end, add a "Notes" section with any rules/policies/instructions that are NOT one of the entries above. If none, write "Notes: none".\n\nHere is the information to use:\n\n[Paste your source information below this line]`;
  return header + context + undef + dates + blocks[shape] + fileOutput + footer;
}

const CSV_TEMPLATES = {
  activity: 'title,activityType,scheduledStart,durationMinutes,venue,description,participantEmails,requiredResources\nSample Match,match,2026-10-05T08:00:00,60,Ground 3,First round,UNDEFINED,UNDEFINED\n',
  recurring: 'title,weekday,startTime,endTime,venue,metadata\nMachine Learning,Monday,09:50,10:40,AV:402,faculty: Mr. Somaraju; subject code: 22AM3112\n',
  daterange: 'title,startDate,endDate,description,metadata\nFirst Mid Term Examinations,2026-08-24,2026-08-27,UNDEFINED,UNDEFINED\n',
};

export function downloadCsvTemplate(shape, label) {
  const blob = new Blob([CSV_TEMPLATES[shape]], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MARSHAL ${label} Template.csv`;
  a.click();
  URL.revokeObjectURL(url);
}