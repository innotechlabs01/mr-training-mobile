import { FONT_FAMILIES_TO_LOAD, useAppFonts } from '../fonts';
import { fontFamilies } from '../tokens';

// The @expo-google-fonts packages wrap expo-font's useFonts with their own
// React hooks, so they must be mocked directly to stay renderer-free.
// Mock fns are declared inside factories (hoisting-safe) and pulled out
// via jest.requireMock.
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));
jest.mock('@expo-google-fonts/archivo', () => ({
  useFonts: jest.fn(() => [true]),
  Archivo_600SemiBold: 'Archivo_600SemiBold',
  Archivo_700Bold: 'Archivo_700Bold',
  Archivo_800ExtraBold: 'Archivo_800ExtraBold',
  Archivo_900Black: 'Archivo_900Black',
}));
jest.mock('@expo-google-fonts/inter', () => ({
  useFonts: jest.fn(() => [true]),
  Inter_400Regular: 'Inter_400Regular',
  Inter_500Medium: 'Inter_500Medium',
  Inter_600SemiBold: 'Inter_600SemiBold',
  Inter_700Bold: 'Inter_700Bold',
  Inter_800ExtraBold: 'Inter_800ExtraBold',
}));

const archivoMock = jest.requireMock('@expo-google-fonts/archivo') as {
  useFonts: jest.Mock;
};
const interMock = jest.requireMock('@expo-google-fonts/inter') as {
  useFonts: jest.Mock;
};

describe('fonts', () => {
  beforeEach(() => {
    archivoMock.useFonts.mockReturnValue([true]);
    interMock.useFonts.mockReturnValue([true]);
  });

  it('declares every family referenced by tokens', () => {
    for (const family of Object.values(fontFamilies)) {
      expect(FONT_FAMILIES_TO_LOAD).toHaveProperty(family);
    }
  });

  it('returns false while fonts load', () => {
    archivoMock.useFonts.mockReturnValue([false]);

    expect(useAppFonts()).toBe(false);

    interMock.useFonts.mockReturnValue([false]);

    expect(useAppFonts()).toBe(false);
  });

  it('returns true once every font resolves', () => {
    expect(useAppFonts()).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(archivoMock.useFonts).toHaveBeenCalledWith(
      expect.objectContaining({ Archivo_900Black: 'Archivo_900Black' }),
    );
  });
});
