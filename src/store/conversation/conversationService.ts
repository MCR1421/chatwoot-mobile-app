import { apiService } from '@/services/APIService';
import type {
  ConversationPayload,
  MessagesPayload,
  MessagesAPIResponse,
  MessageBuilderPayload,
  SendMessageAPIResponse,
  ConversationListAPIResponse,
  ConversationAPIResponse,
  ToggleConversationStatusPayload,
  ToggleConversationStatusResponse,
  BulkActionPayload,
  AssigneePayload,
  AssigneeAPIResponse,
  MarkMessagesUnreadPayload,
  MarkMessagesUnreadAPIResponse,
  MarkMessageReadPayload,
  MarkMessageReadAPIResponse,
  MuteOrUnmuteConversationPayload,
  ConversationLabelPayload,
  AssignTeamPayload,
  AssignTeamAPIResponse,
  DeleteMessagePayload,
  DeleteMessageAPIResponse,
  TypingPayload,
  ConversationListResponse,
  MessagesResponse,
  ConversationResponse,
  MarkMessageReadOrUnreadResponse,
  ToggleConversationStatusAPIResponse,
  TogglePriorityPayload,
  TogglePriorityAPIResponse,
  TogglePriorityResponse,
  TranslateMessagePayload,
  TranslateMessageAPIResponse,
} from './conversationTypes';

import {
  transformConversation,
  transformConversationListMeta,
  transformMessage,
  transformConversationMeta,
} from '@/utils/camelCaseKeys';
import type { AxiosRequestConfig } from 'axios';

// EvoCRM's conversation objects are flat (`contact`, `inbox` at the top
// level); Chatwoot's mobile UI expects them nested under `meta.sender` /
// `meta.assignee` / `meta.channel`. Add `meta` when missing so downstream
// code (contactListener, conversation list/detail screens) doesn't crash.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withConversationMeta = (raw: any): any => {
  if (!raw) return raw;
  return {
    ...raw,
    // EvoCRM's list/detail endpoints don't embed `messages` on the
    // conversation object itself (Chatwoot's do); default to [] so
    // downstream code (getLastMessage, selectors, the Redux reducer) can
    // assume the array always exists.
    messages: raw.messages ?? [],
    ...(raw.meta
      ? {}
      : {
          meta: {
            sender: raw.contact ?? null,
            assignee: raw.assignee ?? null,
            team: raw.team ?? null,
            hmac_verified: null,
            channel: raw.inbox?.channel_type ?? null,
          },
        }),
  };
};

export class ConversationService {
  static async getConversations(payload: ConversationPayload): Promise<ConversationListResponse> {
    const { status, assigneeType, page, sortBy, inboxId = 0 } = payload;

    const params = {
      inbox_id: inboxId || null,
      assignee_type: assigneeType,
      status: status,
      page: page,
      sort_by: sortBy,
    };
    const response = await apiService.get<ConversationListAPIResponse>('conversations', {
      params,
    });
    // EvoCRM returns `data` as a flat array; Chatwoot nests it under
    // `data.payload` + `data.meta`. Normalize both shapes.
    const responseData = response.data.data as unknown;
    const isFlatArray = Array.isArray(responseData);
    const conversations = isFlatArray
      ? (responseData as typeof responseData & unknown[])
      : (responseData as { payload: unknown[] }).payload;
    const meta = isFlatArray
      ? { count: (responseData as unknown[]).length }
      : (responseData as { meta: unknown }).meta;
    const transformedResponse: ConversationListResponse = {
      conversations: (conversations || []).map(withConversationMeta).map(transformConversation),
      meta: transformConversationListMeta(meta || {}),
    };
    return transformedResponse;
  }

  static async fetchConversation(conversationId: number): Promise<ConversationResponse> {
    const response = await apiService.get<ConversationAPIResponse>(
      `conversations/${conversationId}`,
    );

    const rawConversation = (response.data as unknown as { data?: unknown }).data ?? response.data;
    return {
      conversation: transformConversation(withConversationMeta(rawConversation)),
    };
  }

  static async fetchPreviousMessages(payload: MessagesPayload): Promise<MessagesResponse> {
    const { conversationId, beforeId, afterId } = payload;

    const params: Record<string, number> = {};
    if (beforeId) {
      params.before = beforeId;
    }
    if (afterId) {
      params.after = afterId;
    }

    const response = await apiService.get<MessagesAPIResponse>(
      `conversations/${conversationId}/messages`,
      {
        params,
      },
    );
    // EvoCRM returns `{ success, data: [...] }` (flat array, no meta); Chatwoot
    // returns `{ meta, payload: [...] }`.
    const rawMessages =
      (response.data as unknown as { payload?: unknown[] }).payload ??
      (response.data as unknown as { data?: unknown[] }).data ??
      [];
    const meta = (response.data as unknown as { meta?: unknown }).meta ?? {};
    return {
      meta: transformConversationMeta(meta),
      messages: rawMessages.map(transformMessage),
      conversationId,
    };
  }

  static async sendMessage(
    conversationId: number,
    payload: MessageBuilderPayload,
    config: AxiosRequestConfig,
  ): Promise<SendMessageAPIResponse> {
    const response = await apiService.post<SendMessageAPIResponse>(
      `conversations/${conversationId}/messages`,
      payload,
      config,
    );
    return response.data;
  }

  static async toggleConversationStatus({
    conversationId,
    payload,
  }: ToggleConversationStatusPayload): Promise<ToggleConversationStatusResponse> {
    const response = await apiService.post<ToggleConversationStatusAPIResponse>(
      `conversations/${conversationId}/toggle_status`,
      payload,
    );
    const {
      data: { status: currentStatus, snoozed_until: snoozedUntil },
    } = response.data;
    return {
      conversationId,
      currentStatus,
      snoozedUntil,
    };
  }
  static async bulkAction(payload: BulkActionPayload): Promise<void> {
    await apiService.post('bulk_actions', payload);
  }
  static async assignConversation(payload: AssigneePayload): Promise<AssigneeAPIResponse> {
    const { conversationId, assigneeId, teamId } = payload;
    const params = {
      assignee_id: assigneeId,
      team_id: teamId,
    };
    const response = await apiService.post<AssigneeAPIResponse>(
      `conversations/${conversationId}/assignments`,
      params,
    );
    return response.data;
  }

  static async assignTeam(payload: AssignTeamPayload): Promise<AssignTeamAPIResponse> {
    const { conversationId, teamId } = payload;
    const response = await apiService.post<AssignTeamAPIResponse>(
      `conversations/${conversationId}/assignments?team_id=${teamId}`,
    );
    return response.data;
  }

  static async markMessagesUnread(
    payload: MarkMessagesUnreadPayload,
  ): Promise<MarkMessageReadOrUnreadResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<{ data: MarkMessagesUnreadAPIResponse }>(
      `conversations/${conversationId}/unread`,
    );
    // EvoCRM wraps this response in `{success, data: {...}}`, unlike
    // Chatwoot's flat shape the types here were originally written for.
    const { id, unread_count: unreadCount, agent_last_seen_at: agentLastSeenAt } =
      response.data.data;
    return {
      conversationId: id,
      unreadCount,
      agentLastSeenAt,
    };
  }

  static async markMessageRead(
    payload: MarkMessageReadPayload,
  ): Promise<MarkMessageReadOrUnreadResponse> {
    const { conversationId } = payload;
    const response = await apiService.post<{ data: MarkMessageReadAPIResponse }>(
      `conversations/${conversationId}/update_last_seen`,
    );
    // Same EvoCRM `{success, data: {...}}` wrapping as markMessagesUnread above.
    const { id, unread_count: unreadCount, agent_last_seen_at: agentLastSeenAt } =
      response.data.data;
    return {
      conversationId: id,
      unreadCount,
      agentLastSeenAt,
    };
  }

  static async muteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/mute`);
  }

  static async unmuteConversation(payload: MuteOrUnmuteConversationPayload): Promise<void> {
    const { conversationId } = payload;
    await apiService.post(`conversations/${conversationId}/unmute`);
  }

  static async addOrUpdateConversationLabels(payload: ConversationLabelPayload): Promise<void> {
    const { conversationId, labels } = payload;
    await apiService.post(`conversations/${conversationId}/labels`, { labels });
  }

  static async deleteMessage(payload: DeleteMessagePayload): Promise<DeleteMessageAPIResponse> {
    const { conversationId, messageId } = payload;
    const response = await apiService.delete<DeleteMessageAPIResponse>(
      `conversations/${conversationId}/messages/${messageId}`,
    );
    return response.data;
  }

  static async toggleTyping(payload: TypingPayload): Promise<void> {
    const { conversationId, typingStatus, isPrivate } = payload;
    await apiService.post(`conversations/${conversationId}/toggle_typing_status`, {
      typing_status: typingStatus,
      is_private: isPrivate,
    });
  }

  static async togglePriority(payload: TogglePriorityPayload): Promise<TogglePriorityResponse> {
    const { conversationId, priority } = payload;
    const response = await apiService.post<TogglePriorityAPIResponse>(
      `conversations/${conversationId}/toggle_priority`,
      { priority },
    );
    return {
      conversationId,
      priority: response.data.data.priority,
    };
  }

  static async translateMessage(
    payload: TranslateMessagePayload,
  ): Promise<TranslateMessageAPIResponse> {
    const { conversationId, messageId, targetLanguage } = payload;
    const response = await apiService.post<TranslateMessageAPIResponse>(
      `conversations/${conversationId}/messages/${messageId}/translate`,
      { target_language: targetLanguage },
    );
    return response.data;
  }
}
