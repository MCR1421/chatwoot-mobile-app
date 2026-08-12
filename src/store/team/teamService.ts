import type { Team } from '@/types';
import { apiService } from '@/services/APIService';
import { transformTeam } from '@/utils/camelCaseKeys';

export class TeamService {
  static async getTeams(): Promise<Team[]> {
    const response = await apiService.get<Team[]>('teams');
    // EvoCRM returns `{ success, data: [...] }` (flat array); Chatwoot returns
    // the array directly.
    const rawTeams = Array.isArray(response.data)
      ? response.data
      : ((response.data as unknown as { data?: unknown[] }).data ?? []);
    const teams = rawTeams.map(transformTeam);
    return teams;
  }
}
