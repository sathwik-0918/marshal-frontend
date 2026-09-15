/**
 * Pure decision function: given a schedule's visibility, whether the
 * viewer is authenticated, whether they're a MEMBER of THIS specific
 * schedule (not just "logged in somewhere"), and any access code
 * they've entered — decide what they can see.
 */
export function resolveEventAccess({ schedule, isSignedIn, isMember, enteredCode }) {
  const isPublic = schedule.visibility === 'public';

  if (isSignedIn && isMember) {
    return { granted: true, level: 'member' };
  }

  if (isPublic) {
    return { granted: true, level: 'public' };
  }

  if (enteredCode && enteredCode === schedule.accessCode) {
    return { granted: true, level: 'public' };
  }

  return { granted: false };
}