import TimetableGrid from './TimetableGrid';
import WeeklyMenuView from './WeeklyMenuView';
import DateRangeTimeline from './DateRangeTimeline';

export default function ReferenceScheduleView({ referenceEntries }) {
  const timetableEntries = referenceEntries.filter((e) => e.entryType === 'recurring_weekly' && e.startTime);
  const menuEntries = referenceEntries.filter((e) => e.entryType === 'recurring_weekly' && !e.startTime);
  const dateRangeEntries = referenceEntries.filter((e) => e.entryType === 'date_range');

  return (
    <div className="space-y-6">
      {timetableEntries.length > 0 && <section><h2 className="mb-3 text-sm font-medium text-mist">Weekly timetable</h2><TimetableGrid entries={timetableEntries} /></section>}
      {menuEntries.length > 0 && <section><h2 className="mb-3 text-sm font-medium text-mist">Weekly menu</h2><WeeklyMenuView entries={menuEntries} /></section>}
      {dateRangeEntries.length > 0 && <section><h2 className="mb-3 text-sm font-medium text-mist">Calendar periods</h2><DateRangeTimeline entries={dateRangeEntries} /></section>}
    </div>
  );
}