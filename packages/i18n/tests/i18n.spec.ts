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
});
