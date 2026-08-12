import { apiService } from '@/services/APIService';
import type { DashboardAppResponse } from './dashboardAppTypes';
import { transformDashboardApp } from '@/utils/camelCaseKeys';
import { DashboardApp } from '@/types';

export class DashboardAppService {
  static async index(): Promise<DashboardAppResponse> {
    const response = await apiService.get<DashboardApp[]>('dashboard_apps');
    // EvoCRM wraps arrays as `{ success, data: [...] }`; Chatwoot returns the
    // array directly.
    const rawApps = Array.isArray(response.data)
      ? response.data
      : ((response.data as unknown as { data?: unknown[] }).data ?? []);
    const dashboardApps = rawApps.map(transformDashboardApp);
    return {
      payload: dashboardApps,
    };
  }
}
