import {
  useFonts,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

/** Maps every PostScript family name (as used in tokens.fontFamilies) to its font resource. */
export const FONT_FAMILIES_TO_LOAD = {
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} as const;

/**
 * Returns true once every brand font is ready. Render nothing until this resolves —
 * see FontGate in src/navigation/App.tsx.
 */
export function useAppFonts(): boolean {
  const [archivoLoaded, archivoError] = useFonts({
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
  });
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  if (archivoError) console.error('[fonts] Archivo load failed', archivoError);
  if (interError) console.error('[fonts] Inter load failed', interError);
  return archivoLoaded === true && interLoaded === true;
}
