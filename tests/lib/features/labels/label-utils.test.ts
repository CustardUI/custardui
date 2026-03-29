import { describe, it, expect } from 'vitest';
import { computeTextColor, resolveColor } from '../../../../src/lib/features/labels/label-utils';

describe('resolveColor', () => {
  it('expands single-letter shorthands to light-theme hex by default', () => {
    expect(resolveColor('r', false)).toBe('#fca5a5');
    expect(resolveColor('g', false)).toBe('#4ade80');
    expect(resolveColor('b', false)).toBe('#93c5fd');
    expect(resolveColor('c', false)).toBe('#67e8f9');
    expect(resolveColor('m', false)).toBe('#f0abfc');
    expect(resolveColor('y', false)).toBe('#fde047');
    expect(resolveColor('w', false)).toBe('#f1f5f9');
    expect(resolveColor('k', false)).toBe('#e2e8f0');
  });

  it('expands single-letter shorthands to dark-theme hex when isDark=true', () => {
    expect(resolveColor('r', true)).toBe('#dc2626');
    expect(resolveColor('g', true)).toBe('#16a34a');
    expect(resolveColor('b', true)).toBe('#2563eb');
    expect(resolveColor('c', true)).toBe('#0d9488');
    expect(resolveColor('m', true)).toBe('#a21caf');
    expect(resolveColor('y', true)).toBe('#92400e');
    expect(resolveColor('w', true)).toBe('#94a3b8');
    expect(resolveColor('k', true)).toBe('#0f172a');
  });

  it('returns non-shorthand values unchanged', () => {
    expect(resolveColor('#3b82f6', false)).toBe('#3b82f6');
    expect(resolveColor('#3b82f6', true)).toBe('#3b82f6');
    expect(resolveColor('blue', false)).toBe('blue');
    expect(resolveColor('', false)).toBe('');
  });
});

describe('computeTextColor', () => {
  it('returns white text for dark backgrounds (#rrggbb)', () => {
    expect(computeTextColor('#000000')).toBe('#ffffff');
    expect(computeTextColor('#1a1a1a')).toBe('#ffffff');
    expect(computeTextColor('#3b82f6')).toBe('#ffffff'); // blue
    expect(computeTextColor('#ef4444')).toBe('#ffffff'); // red
  });

  it('returns black text for light backgrounds (#rrggbb)', () => {
    expect(computeTextColor('#ffffff')).toBe('#000000');
    expect(computeTextColor('#f5f521')).toBe('#000000'); // yellow
    expect(computeTextColor('#d1fae5')).toBe('#000000'); // light green
  });

  it('handles short hex #rgb', () => {
    expect(computeTextColor('#000')).toBe('#ffffff');
    expect(computeTextColor('#fff')).toBe('#000000');
    expect(computeTextColor('#f00')).toBe('#ffffff'); // red
  });

  it('falls back to white for non-hex strings', () => {
    expect(computeTextColor('blue')).toBe('#ffffff');
    expect(computeTextColor('rgb(0,0,0)')).toBe('#ffffff');
    expect(computeTextColor('')).toBe('#ffffff');
  });
});
