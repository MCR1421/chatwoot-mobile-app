import { apiService } from '@/services/APIService';
import type { LabelResponse } from './labelTypes';
import { transformLabel } from '@/utils/camelCaseKeys';

export class LabelService {
  static async index(): Promise<LabelResponse> {
    const response = await apiService.get<LabelResponse>('labels');
    // EvoCRM returns `{ success, data: [...] }` (flat array); Chatwoot returns
    // `{ payload: [...] }` directly.
    const rawLabels =
      (response.data as unknown as { payload?: unknown[] }).payload ??
      (response.data as unknown as { data?: unknown[] }).data ??
      [];
    const labels = rawLabels.map(transformLabel);
    return {
      payload: labels,
    };
  }
}
