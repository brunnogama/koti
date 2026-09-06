import { HAConnectionConfig, HAEntityState, HAWebSocketMessage } from '../types/homeAssistant';

type StateChangeCallback = (entityId: string, newState: HAEntityState) => void;
type StatusCallback = (status: 'disconnected' | 'connecting' | 'connected' | 'auth_failed') => void;

class HAWebSocketClient {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private config: HAConnectionConfig | null = null;
  private stateChangeListeners: Set<StateChangeCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private entities: Map<string, HAEntityState> = new Map();
  private reconnectTimer: number | null = null;
  private isIntentionalClose = false;

  public connect(config: HAConnectionConfig) {
    this.config = config;
    this.isIntentionalClose = false;

    if (config.useDemoMode) {
      this.notifyStatus('connected');
      return;
    }

    if (this.ws) {
      this.disconnect();
    }

    this.notifyStatus('connecting');

    // Normalize URL
    let cleanHost = config.host.trim().replace(/^https?:\/\//i, '').replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
    const isHttps = config.host.toLowerCase().startsWith('https');
    const wsProtocol = isHttps ? 'wss' : 'ws';
    const httpProtocol = isHttps ? 'https' : 'http';
    const wsUrl = `${wsProtocol}://${cleanHost}/api/websocket`;

    // Immediate REST fetch to quickly populate entities
    if (config.token) {
      fetch(`${httpProtocol}://${cleanHost}/api/states`, {
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((states) => {
          if (Array.isArray(states)) {
            states.forEach((entity: HAEntityState) => {
              this.entities.set(entity.entity_id, entity);
              this.notifyStateChange(entity.entity_id, entity);
            });
            this.notifyStatus('connected');
          }
        })
        .catch((e) => {
          console.warn('[Koti HA] REST fetch initial states error', e);
        });
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Koti HA] WebSocket connected, awaiting auth_required');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: HAWebSocketMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('[Koti HA] Error parsing message', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[Koti HA] WebSocket error', err);
        this.notifyStatus('disconnected');
      };

      this.ws.onclose = () => {
        this.notifyStatus('disconnected');
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[Koti HA] Failed to establish connection', err);
      this.notifyStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus('disconnected');
  }

  private handleMessage(msg: HAWebSocketMessage) {
    if (msg.type === 'auth_required') {
      if (!this.config?.token) {
        this.notifyStatus('auth_failed');
        return;
      }
      this.sendRaw({
        type: 'auth',
        access_token: this.config.token,
      });
    } else if (msg.type === 'auth_ok') {
      this.notifyStatus('connected');
      this.fetchInitialStates();
      this.subscribeEvents();
    } else if (msg.type === 'auth_invalid') {
      this.notifyStatus('auth_failed');
    } else if (msg.type === 'event' && msg.event?.event_type === 'state_changed') {
      const data = msg.event.data;
      if (data?.entity_id && data?.new_state) {
        this.entities.set(data.entity_id, data.new_state);
        this.notifyStateChange(data.entity_id, data.new_state);
      }
    } else if (msg.type === 'result' && Array.isArray(msg.result)) {
      // Result from get_states
      msg.result.forEach((entity: HAEntityState) => {
        this.entities.set(entity.entity_id, entity);
        this.notifyStateChange(entity.entity_id, entity);
      });
    }
  }

  private fetchInitialStates() {
    this.sendMessage({
      id: this.messageId++,
      type: 'get_states',
    });
  }

  private subscribeEvents() {
    this.sendMessage({
      id: this.messageId++,
      type: 'subscribe_events',
      event_type: 'state_changed',
    });
  }

  public callService(domain: string, service: string, serviceData: Record<string, any> = {}) {
    if (this.config?.useDemoMode) {
      // Simulate state changes in demo mode
      this.simulateDemoServiceCall(domain, service, serviceData);
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        id: this.messageId++,
        type: 'call_service',
        domain,
        service,
        service_data: serviceData,
      });
    } else if (this.config?.token) {
      // Direct REST fallback
      const isHttps = this.config.host.toLowerCase().startsWith('https');
      const httpProtocol = isHttps ? 'https' : 'http';
      const cleanHost = this.config.host.trim().replace(/^https?:\/\//i, '').replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
      fetch(`${httpProtocol}://${cleanHost}/api/services/${domain}/${service}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      }).catch((err) => console.error('[Koti HA] REST fallback error', err));
    }
  }

  private simulateDemoServiceCall(domain: string, service: string, serviceData: Record<string, any>) {
    const entityId = serviceData.entity_id;
    if (!entityId) return;

    const current = this.entities.get(entityId);
    if (!current) return;

    let updatedState = { ...current };

    if (service === 'turn_on') {
      updatedState.state = 'on';
      if (serviceData.brightness !== undefined) {
        updatedState.attributes = { ...updatedState.attributes, brightness: serviceData.brightness };
      }
      if (serviceData.rgb_color !== undefined) {
        updatedState.attributes = { ...updatedState.attributes, rgb_color: serviceData.rgb_color };
      }
    } else if (service === 'turn_off') {
      updatedState.state = 'off';
    } else if (service === 'toggle') {
      updatedState.state = current.state === 'on' ? 'off' : 'on';
    } else if (service === 'set_temperature') {
      if (serviceData.temperature !== undefined) {
        updatedState.attributes = { ...updatedState.attributes, temperature: serviceData.temperature };
      }
    }

    updatedState.last_updated = new Date().toISOString();
    this.entities.set(entityId, updatedState);
    this.notifyStateChange(entityId, updatedState);
  }

  private sendMessage(msg: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private sendRaw(msg: Record<string, any>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.config && !this.isIntentionalClose) {
        this.connect(this.config);
      }
    }, 5000);
  }

  public onStateChange(cb: StateChangeCallback) {
    this.stateChangeListeners.add(cb);
    return () => this.stateChangeListeners.delete(cb);
  }

  public onStatus(cb: StatusCallback) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private notifyStateChange(entityId: string, state: HAEntityState) {
    this.stateChangeListeners.forEach((cb) => cb(entityId, state));
  }

  private notifyStatus(status: 'disconnected' | 'connecting' | 'connected' | 'auth_failed') {
    this.statusListeners.forEach((cb) => cb(status));
  }

  public setEntities(entities: Record<string, HAEntityState>) {
    Object.entries(entities).forEach(([id, entity]) => {
      this.entities.set(id, entity);
    });
  }

  public getEntity(entityId: string): HAEntityState | undefined {
    return this.entities.get(entityId);
  }

  public getAllEntities(): Record<string, HAEntityState> {
    const result: Record<string, HAEntityState> = {};
    this.entities.forEach((val, key) => {
      result[key] = val;
    });
    return result;
  }
}

export const haWebSocket = new HAWebSocketClient();
