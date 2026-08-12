import { apiService } from '@/services/APIService';
import type { CustomAttributeResponse } from './customAttributeTypes';
import { transformCustomAttribute } from '@/utils/camelCaseKeys';
import { CustomAttribute } from '@/types';

export class CustomAttributeService {
  static async index(): Promise<CustomAttributeResponse> {
    const response = await apiService.get<CustomAttribute[]>('custom_attribute_definitions');
    // EvoCRM wraps arrays as `{ success, data: [...] }`; Chatwoot returns the
    // array directly.
    const rawAttributes = Array.isArray(response.data)
      ? response.data
      : ((response.data as unknown as { data?: unknown[] }).data ?? []);
    const customAttributes = rawAttributes.map(transformCustomAttribute);
    return {
      payload: customAttributes,
    };
  }
}
