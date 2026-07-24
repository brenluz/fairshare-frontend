import { serviceErrorMessage } from './api-error';

describe('serviceErrorMessage', () => {
  it('treats status 0 (no connection) as a reachability problem', () => {
    expect(serviceErrorMessage(0)).toContain('connection');
  });

  it('treats 5xx as temporary unavailability', () => {
    expect(serviceErrorMessage(500)).toContain('temporarily unavailable');
    expect(serviceErrorMessage(503)).toContain('temporarily unavailable');
  });

  it('gives a generic message for other statuses', () => {
    expect(serviceErrorMessage(418)).toBe('Something went wrong. Please try again.');
  });

  it('never mentions infrastructure the user cannot act on', () => {
    for (const status of [0, 500, 502, 418]) {
      const msg = serviceErrorMessage(status).toLowerCase();
      expect(msg).not.toContain('backend');
      expect(msg).not.toContain('server');
    }
  });
});
