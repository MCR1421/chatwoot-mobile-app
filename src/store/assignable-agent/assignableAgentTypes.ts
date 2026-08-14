import { Agent } from '@/types';

export interface AssignableAgentAPIResponse {
  success: boolean;
  data: Agent[];
}

export interface AssignableAgentResponse {
  agents: Agent[];
  inboxIds: number[];
}

export interface AssignableAgentPayload {
  inboxIds: number[];
}
