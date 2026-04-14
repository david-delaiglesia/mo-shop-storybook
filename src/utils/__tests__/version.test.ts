import { getNumericAppVersion } from 'utils/version'

describe('Version Utils', () => {
  describe('getNumericAppVersion', () => {
    it('should return the numeric part of a version string', () => {
      expect(getNumericAppVersion('v1')).toBe('1')
      expect(getNumericAppVersion('v1234')).toBe('1234')

      expect(getNumericAppVersion('v1-canary.123-456')).toBe('1')
      expect(getNumericAppVersion('v1234-canary.0-0')).toBe('1234')
      expect(getNumericAppVersion('v2-canary.0-0')).toBe('2')
      expect(getNumericAppVersion('v10-canary.999-999')).toBe('10')

      expect(getNumericAppVersion('master-123-456')).toBe('master-123-456')
      expect(getNumericAppVersion('master-0-0')).toBe('master-0-0')
    })
  })
})
