import { goApiClient } from '@infrastructure/api/client';

export interface ImportResult {
  sessionsImported: number;
  setsImported: number;
  exercisesCreated?: string[];
}

/** Import athlete history CSV */
export const importData = async (athleteID: string, source: string, csvData: string): Promise<ImportResult> => {
  const { data } = await goApiClient.post<ImportResult>('/import', { athleteID, source, csvData });
  return data;
};
