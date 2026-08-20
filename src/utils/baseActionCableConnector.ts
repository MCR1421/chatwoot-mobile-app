import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';

const cable = new Cable({});
const channelName = 'RoomChannel';
const PRESENCE_INTERVAL = 20000;

export interface ActionCableEvent<T = unknown> {
  event: string;
  data: T;
}

class BaseActionCableConnector {
  protected events: { [key: string]: (data: unknown) => void };
  protected accountId: number | string;

  constructor(
    pubSubToken: string,
    webSocketUrl: string,
    accountId: number | string,
    userId: number | string,
  ) {
    const connectActionCable = ActionCable.createConsumer(webSocketUrl);

    const channel = cable.setChannel(
      channelName,
      connectActionCable.subscriptions.create(
        {
          channel: channelName,
          pubsub_token: pubSubToken,
          account_id: accountId,
          user_id: userId,
        },
        {
          updatePresence(): void {
            this.perform('update_presence');
          },
        },
      ),
    );

    channel.on('received', this.onReceived);
    channel.on('connected', this.handleConnected);
    channel.on('disconnect', this.handleDisconnected);
    channel.on('rejected', this.handleRejected);

    this.events = {};
    this.accountId = accountId;

    setInterval(() => {
      cable.channel(channelName).perform('update_presence');
    }, PRESENCE_INTERVAL);
  }

  protected isAValidEvent = (data: unknown): boolean => {
    const { account_id: accountId } = data as { account_id?: number | string };
    // EvoCRM is single-tenant: broadcast payloads (message.push_event_data,
    // conversation.push_event_data, ...) carry no account_id at all, unlike
    // Chatwoot's multi-tenant payloads. Treat a missing account_id as "any
    // account" instead of dropping every event.
    if (accountId == null) return true;
    return String(this.accountId) === String(accountId);
  };

  private onReceived = ({ event, data }: ActionCableEvent = { event: '', data: null }): void => {
    if (this.isAValidEvent(data)) {
      if (this.events[event] && typeof this.events[event] === 'function') {
        this.events[event](data);
      }
    }
  };

  private handleConnected = (): void => {
    console.log('Connected to ActionCable');
  };

  private handleDisconnected = (): void => {
    console.log('Disconnected from ActionCable');
  };

  private handleRejected = (): void => {
    console.log('ActionCable subscription rejected');
  };
}

export default BaseActionCableConnector;
