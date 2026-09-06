export type EntityDomain = 
  | 'light'
  | 'switch'
  | 'sensor'
  | 'binary_sensor'
  | 'climate'
  | 'cover'
  | 'lock'
  | 'media_player'
  | 'scene';

export interface HAEntityState {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    brightness?: number; // 0-255
    rgb_color?: [number, number, number];
    color_temp?: number;
    current_temperature?: number;
    temperature?: number;
    target_temp_high?: number;
    target_temp_low?: number;
    hvac_modes?: string[];
    hvac_action?: string;
    unit_of_measurement?: string;
    device_class?: string;
    battery_level?: number;
    icon?: string;
    supported_features?: number;
    [key: string]: any;
  };
  last_changed: string;
  last_updated: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'auth_failed';

export interface HAConnectionConfig {
  host: string; // e.g., '192.168.1.100:8123' or 'http://homeassistant.local:8123'
  token: string; // Long-Lived Access Token
  useDemoMode: boolean;
}

export type HAConfig = HAConnectionConfig;

export interface HAWebSocketMessage {
  id?: number;
  type: string;
  success?: boolean;
  event?: {
    event_type: string;
    data: {
      entity_id: string;
      new_state: HAEntityState;
      old_state: HAEntityState;
    };
  };
  result?: any;
  error?: {
    code: string;
    message: string;
  };
  [key: string]: any;
}
