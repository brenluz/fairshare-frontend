import { avatarColor, avatarGradient, initial, initials } from './avatar';

describe('avatar', () => {
  describe('initials', () => {
    it('takes the first two letters, uppercased', () => {
      expect(initials('Maya')).toBe('MA');
    });

    it('handles a single-character name', () => {
      expect(initials('a')).toBe('A');
    });

    it('falls back to ? for undefined', () => {
      expect(initials(undefined)).toBe('?');
    });
  });

  describe('initial', () => {
    it('takes the first letter, uppercased', () => {
      expect(initial('Lisbon')).toBe('L');
    });

    it('falls back to ? for undefined', () => {
      expect(initial(undefined)).toBe('?');
    });
  });

  describe('avatarColor', () => {
    it('is deterministic for the same key', () => {
      expect(avatarColor('maya@x.com')).toBe(avatarColor('maya@x.com'));
    });

    it('returns a hex colour from the palette', () => {
      expect(avatarColor('anyone@x.com')).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('avatarGradient', () => {
    it('is deterministic for the same key', () => {
      expect(avatarGradient('Lisbon')).toBe(avatarGradient('Lisbon'));
    });

    it('returns a 135deg linear-gradient', () => {
      expect(avatarGradient('Lisbon')).toMatch(/^linear-gradient\(135deg, #[0-9A-Fa-f]{6}, #[0-9A-Fa-f]{6}\)$/);
    });
  });
});
