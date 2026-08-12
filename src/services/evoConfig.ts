// Phase 0 spike: EvoCRM backend runs as two services, reached over LAN Wi-Fi
// from the test device (adb reverse USB tunnels proved unreliable on this
// machine — Docker/WSL2 squats several ports, including 8081). See
// docs/superpowers/plans/2026-08-10-mobile-app-phase0-findings.md.
const DEV_MACHINE_LAN_IP = '192.168.1.18';
export const EVO_AUTH_URL = `http://${DEV_MACHINE_LAN_IP}:3011`;
export const EVO_CRM_URL = `http://${DEV_MACHINE_LAN_IP}:3020`;
// EvoCRM's ActionCable is mounted at the default Rails path on the same
// service/port as the REST API; RoomChannel auth uses pubsub_token +
// user_id (see room_channel.rb), not the REST Bearer token.
export const EVO_CRM_WS_URL = `ws://${DEV_MACHINE_LAN_IP}:3020/cable`;
