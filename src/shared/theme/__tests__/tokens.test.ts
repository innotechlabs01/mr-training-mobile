import { colors, typography, spacing, radius, shadows, fontFamilies } from '../tokens';

describe('tokens', () => {
  it('exposes the Volt color system', () => {
    expect(colors.base).toBe('#111214');
    expect(colors.surface).toBe('#191B1E');
    expect(colors.surfaceRaised).toBe('#202329');
    expect(colors.border).toBe('#26292E');
    expect(colors.primary).toBe('#C8FF00');
    expect(colors.primaryPressed).toBe('#A8D900');
    expect(colors.text).toBe('#F5F5F7');
    expect(colors.textSecondary).toBe('#9CA3AF');
    expect(colors.success).toBe('#34D399');
    expect(colors.warning).toBe('#FBBF24');
    expect(colors.error).toBe('#FF5A5F');
  });

  it('exposes the typography scale', () => {
    expect(typography.display.fontSize).toBeGreaterThanOrEqual(40);
    expect(typography.display.fontSize).toBeLessThanOrEqual(48);
    expect(typography.title.fontSize).toBe(20);
    expect(typography.body.fontSize).toBe(15);
    expect(typography.label.fontSize).toBe(11);
    expect(typography.label.letterSpacing).toBe(2);
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
    expect(radius).toMatchObject({ sm: 8, md: 12, lg: 16, xl: 24, full: 9999 });
  });
});
