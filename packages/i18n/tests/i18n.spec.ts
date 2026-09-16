import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLanguage, getLanguage } from '../src/i18n.js';

describe('i18n Module', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('should translate english keys correctly', () => {
    expect(t('app.name')).toBe('EyePosture');
    expect(t('nav.dashboard')).toBe('Dashboard');
  });

  it('should interpolate variables accurately', () => {
    expect(t('dashboard.greeting', { name: 'Alice' })).toBe('Good day, Alice');
  });

  it('should switch to Vietnamese and translate correctly', () => {
    setLanguage('vi');
    expect(getLanguage()).toBe('vi');
    expect(t('nav.dashboard')).toBe('Tổng quan');
    expect(t('dashboard.greeting', { name: 'Huy' })).toBe('Xin chào, Huy');
    expect(t('notifications.distance_too_close')).toBe('Bạn đang ngồi hơi gần màn hình.');
  });

  it('should fallback gracefully for non-existent keys', () => {
    expect(t('non.existent.translation_key')).toBe('non.existent.translation_key');
  });

  it('should have 100% key parity between en and vi dictionaries', async () => {
    const { en } = await import('../src/locales/en.js');
    const { vi } = await import('../src/locales/vi.js');

    function getAllKeys(obj: any, prefix = ''): string[] {
      let keys: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          keys = keys.concat(getAllKeys(v, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    const enKeys = getAllKeys(en);
    const viKeys = getAllKeys(vi);

    const missingInVi = enKeys.filter((k) => !viKeys.includes(k));
    const missingInEn = viKeys.filter((k) => !enKeys.includes(k));

    expect(missingInVi).toEqual([]);
    expect(missingInEn).toEqual([]);
    expect(viKeys.length).toBe(enKeys.length);
  });
});
