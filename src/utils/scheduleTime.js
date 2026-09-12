/**
 * Pure functions, no React, no side effects — deliberately, so they
 * can be tested directly without mounting a component. This is the
 * one piece of logic on this screen that actually matters: multiple
 * activities can be live at once, in different venues. Nothing here
 * assumes there's only one "current" activity.
 */

export function getCurrentActivities(activities, now = new Date()) {
  return activities.filter((activity) => {
    if (activity.status === 'cancelled' || activity.status === 'completed') {
      return false;
    }
    if (activity.status === 'in_progress' || activity.status === 'delayed') {
      return true;
    }
    const start = new Date(activity.scheduledStart);
    const end = new Date(start.getTime() + activity.durationMinutes * 60000);
    return now >= start && now < end;
  });
}

/** Excludes anything already counted as live (in_progress/delayed) —
 *  an activity being actively handled right now shouldn't also show
 *  up in "upcoming" just because its original time window is later. */
export function getUpcomingActivities(activities, now = new Date(), limit = 5) {
  return activities
    .filter((a) => {
      if (a.status === 'cancelled' || a.status === 'in_progress' || a.status === 'delayed') {
        return false;
      }
      return new Date(a.scheduledStart) > now;
    })
    .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart))
    .slice(0, limit);
}

export function groupByVenue(activities) {
  return activities.reduce((groups, activity) => {
    const key = activity.venue;
    if (!groups[key]) groups[key] = [];
    groups[key].push(activity);
    return groups;
  }, {});
}

export function formatTime(dateInput) {
  return new Date(dateInput).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}