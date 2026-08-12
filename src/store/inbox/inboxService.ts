import { apiService } from '@/services/APIService';
import type { InboxResponse } from './inboxTypes';
import { transformInbox } from '@/utils/camelCaseKeys';

export class InboxService {
  static async index(): Promise<InboxResponse> {
    const response = await apiService.get<InboxResponse>('inboxes');
    // EvoCRM returns `{ success, data: [...] }` (flat array); Chatwoot returns
    // `{ payload: [...] }` directly.
    const rawInboxes =
      (response.data as unknown as { payload?: unknown[] }).payload ??
      (response.data as unknown as { data?: unknown[] }).data ??
      [];
    const inboxes = rawInboxes.map(transformInbox);
    return {
      payload: inboxes,
    };
  }
}
