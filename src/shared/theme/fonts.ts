import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
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
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
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
  const [montserratLoaded, montserratError] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  if (montserratError) console.error('[fonts] Montserrat load failed', montserratError);
  if (interError) console.error('[fonts] Inter load failed', interError);
  return montserratLoaded === true && interLoaded === true;
}
