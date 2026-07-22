/**
 * User-facing copy for HTTP failures that aren't the user's fault.
 *
 * These messages are read by people using the app, not by developers — so they
 * describe the service being unavailable and what to do about it, and never ask
 * the reader to check infrastructure. Callers handle their own expected 4xx
 * cases (e.g. 401 = bad credentials) and fall back to this for everything else.
 */
export function serviceErrorMessage(status: number): string {
  // status 0 = the request never reached a server (offline, DNS, connection refused).
  if (status === 0) {
    return 'Can’t reach FairShare right now. Check your connection and try again.';
  }

  if (status >= 500) {
    return 'FairShare is temporarily unavailable. Please try again in a moment.';
  }

  return 'Something went wrong. Please try again.';
}
