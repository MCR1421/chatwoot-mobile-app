// EvoCRM backend runs as two services, reached via Cloudflare Tunnel public
// hostnames (not the dev machine's LAN IP) so the app works from any network,
// not just the same Wi-Fi as the dev PC. Routes added 2026-08-14 in
// C:\Windows\System32\config\systemprofile\.cloudflared\config.yml.
export const EVO_AUTH_URL = 'https://evocrm-auth.prpecaseletricas.online';
export const EVO_CRM_URL = 'https://evocrm-api.prpecaseletricas.online';
// EvoCRM's ActionCable is mounted at the default Rails path on the same
// service/port as the REST API; RoomChannel auth uses pubsub_token +
// user_id (see room_channel.rb), not the REST Bearer token.
export const EVO_CRM_WS_URL = 'wss://evocrm-api.prpecaseletricas.online/cable';
