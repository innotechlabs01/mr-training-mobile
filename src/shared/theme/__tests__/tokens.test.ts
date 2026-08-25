import { colors, typography, spacing, radius, shadows, fontFamilies } from '../tokens';

describe('tokens', () => {
  it('exposes the Apex Performance color system', () => {
    expect(colors.base).toBe('#0A0A0B');
    expect(colors.surface).toBe('#131315');
    expect(colors.surfaceRaised).toBe('#1E1E20');
    expect(colors.border).toBe('#2C2C2E');
    expect(colors.primary).toBe('#FF5C00');
    expect(colors.primaryPressed).toBe('#CC4A00');
    expect(colors.secondary).toBe('#007AFF');
    expect(colors.text).toBe('#FFFFFF');
    expect(colors.textSecondary).toBe('#8E8E93');
    expect(colors.success).toBe('#34D399');
    expect(colors.warning).toBe('#FBBF24');
    expect(colors.error).toBe('#FFB4AB');
  });

  it('exposes the typography scale', () => {
    expect(typography.display.fontSize).toBeGreaterThanOrEqual(40);
    expect(typography.display.fontSize).toBeLessThanOrEqual(48);
    expect(typography.title.fontSize).toBe(20);
    expect(typography.body.fontSize).toBe(16);
    expect(typography.label.fontSize).toBe(14);
    expect(typography.label.letterSpacing).toBe(0.05);
  });

  it('references only fonts loaded by fonts.ts', () => {
    const usedFamilies = Object.values(typography).map((t) => t.fontFamily);
    for (const family of usedFamilies) {
      expect(Object.values(fontFamilies)).toContain(family);
    }
  });

  it('exposes shadow presets', () => {
    expect(shadows.sm).toMatchObject({ shadowOpacity: 0.2, elevation: 2 });
    expect(shadows.md).toMatchObject({ shadowOpacity: 0.3, elevation: 4 });
    expect(Object.keys(shadows.sm)).toContain('shadowColor');
  });

  it('exposes spacing and radius scales', () => {
    expect(spacing).toMatchObject({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 });
    expect(radius).toMatchObject({ sm: 2, md: 4, lg: 8, xl: 12, full: 9999 });
  });
});
