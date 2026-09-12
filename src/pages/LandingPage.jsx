import GlassNav from '../components/marketing/GlassNav';
import ScheduleReflowDemo from '../components/marketing/ScheduleReflowDemo';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    name: 'Cultural fests',
    span: 'md:col-span-2 md:row-span-2',
    color: 'var(--color-cat-fest)',
    copy: "Ten days, a dozen venues, hundreds of moving parts. When the auditorium goes dark at 4pm, MARSHAL doesn't wait for someone to notice.",
  },
  {
    name: 'Tournaments',
    span: '',
    color: 'var(--color-cat-tournament)',
    copy: '"Running 20 late" becomes a new slot that collides with nothing, proposed in seconds.',
  },
  {
    name: '40-day campaigns',
    span: '',
    color: 'var(--color-cat-campaign)',
    copy: 'Long dependencies, many owners. One missed deadline, fully traced back to why.',
  },
  {
    name: 'Your own week',
    span: 'md:col-span-2',
    color: 'var(--color-cat-personal)',
    copy: 'One person, no approvals needed. The same engine, scaled all the way down.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-chalk">
      <GlassNav />

      <section className="relative overflow-hidden px-6 pt-40 pb-24">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-cat-fest)' }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          <h1 className="max-w-3xl text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
            Plans survive the first five minutes.
            <br />
            MARSHAL handles what happens after.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-mist">
            Upload any schedule — a tournament, a 10-day fest, a 40-day campaign.
            When reality changes, MARSHAL proposes a fix and keeps everyone synced.
          </p>

          <div className="mt-8 flex items-center gap-3">

            <a href="#discover"
            className="rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-ink hover:brightness-110 transition"
            >
            Find an event
          </a>
          <Link
            to="/sign-up"
            className="rounded-sm border border-border px-5 py-2.5 text-sm font-medium text-chalk hover:border-mist transition"
          >
            Start a schedule
          </Link>
        </div>

        <div className="mt-16">
          <ScheduleReflowDemo />
        </div>
    </div>
      </section >

    <section id="discover" className="mx-auto max-w-5xl px-6 pb-28">
      <h2 className="mb-6 text-sm font-medium text-mist">One engine, four kinds of chaos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            className={`rounded-lg border border-white/10 p-6 flex flex-col justify-end min-h-[160px] ${cat.span}`}
            style={{ background: `linear-gradient(160deg, ${cat.color}26 0%, transparent 60%)` }}
          >
            <div className="mb-3 h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <h3 className="text-lg font-semibold">{cat.name}</h3>
            <p className="mt-1.5 text-sm text-mist">{cat.copy}</p>
          </div>
        ))}
      </div>
    </section>
    </div >
  );
}