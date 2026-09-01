import { goApiClient } from '@infrastructure/api/client';

export interface AvailabilitySlot { id: string; dayOfWeek: number; startTime: string; endTime: string; }

export const getAvailability = async (): Promise<AvailabilitySlot[]> => {
  const { data } = await goApiClient.get('/athlete/availability');
  const payload = (data as any)?.data ?? data;
  return payload?.availability ?? (Array.isArray(payload) ? payload : []);
};

export const createAppointment = async (params: { date: string; startTime: string; endTime: string; notes?: string }): Promise<void> => {
  await goApiClient.post('/athlete/appointments', params);
};
