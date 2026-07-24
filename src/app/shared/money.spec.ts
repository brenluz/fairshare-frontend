import { euro, isZero, signedEuro } from './money';

describe('money', () => {
  describe('euro', () => {
    it('formats with two decimals and the euro sign', () => {
      expect(euro(240)).toBe('€240.00');
      expect(euro(5.5)).toBe('€5.50');
    });

    it('uses the absolute value (no leading minus)', () => {
      expect(euro(-85.5)).toBe('€85.50');
    });

    it('formats zero', () => {
      expect(euro(0)).toBe('€0.00');
    });
  });

  describe('signedEuro', () => {
    it('prefixes a plus for positive amounts', () => {
      expect(signedEuro(240)).toBe('+€240.00');
    });

    it('prefixes a true minus sign (U+2212) for negative amounts', () => {
      expect(signedEuro(-85.5)).toBe('−€85.50');
    });

    it('has no sign for zero', () => {
      expect(signedEuro(0)).toBe('€0.00');
    });
  });

  describe('isZero', () => {
    it('treats exact zero and sub-cent values as zero', () => {
      expect(isZero(0)).toBe(true);
      expect(isZero(0.004)).toBe(true);
      expect(isZero(-0.004)).toBe(true);
    });

    it('treats a cent or more as non-zero', () => {
      expect(isZero(0.01)).toBe(false);
      expect(isZero(-0.01)).toBe(false);
    });
  });
});
