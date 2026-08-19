import { apiService } from '@/services/APIService';
import type {
  ConversationParticipantPayload,
  ConversationParticipantResponse,
  UpdateConversationParticipantPayload,
} from './conversationParticipantTypes';
import { transformAgent } from '@/utils/camelCaseKeys';
import { Agent } from '@/types';

interface ParticipantRecord {
  id: string;
  user_id: string;
  conversation_id: string;
  user: Agent | null;
  created_at: number;
}

interface ParticipantsAPIResponse {
  success: boolean;
  data: ParticipantRecord[];
}

const toAgents = (records: ParticipantRecord[]): Agent[] =>
  records.filter(record => record.user).map(record => transformAgent(record.user));

export class ConversationParticipantService {
  static async index(
    payload: ConversationParticipantPayload,
  ): Promise<ConversationParticipantResponse> {
    const { conversationId } = payload;
    const response = await apiService.get<ParticipantsAPIResponse>(
      `conversations/${conversationId}/participants`,
    );
    return {
      participants: toAgents(response.data.data),
      conversationId,
    };
  }

  static async update(
    payload: UpdateConversationParticipantPayload,
  ): Promise<ConversationParticipantResponse> {
    const { conversationId, userIds } = payload;
    const response = await apiService.put<ParticipantsAPIResponse>(
      `conversations/${conversationId}/participants`,
      { user_ids: userIds },
    );
    return {
      participants: toAgents(response.data.data),
      conversationId,
    };
  }
}
