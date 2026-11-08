import { HAConnectionConfig, HAEntityState, HAWebSocketMessage } from '../types/homeAssistant';

type StateChangeCallback = (entityId: string, newState: HAEntityState) => void;
type StatusCallback = (status: 'disconnected' | 'connecting' | 'connected' | 'auth_failed') => void;

export function normalizeHost(raw: string): { host: string; secure: boolean } {
  const trimmed = raw.trim();
  const secure = /^(https|wss):\/\//i.test(trimmed);
  const host = trimmed.replace(/^(https?|wss?):\/\//i, '').replace(/\/+$/, '');
  // No port typed: behave like the browser (http -> 80, https -> 443)
  return { host, secure };
}

export interface HATestResult {
  ok: boolean;
  error?: string;
  host?: string; // host (with port) that actually answered
  version?: string;
  locationName?: string;
  total: number;
  counts: Record<string, number>;
}

export async function testHAConnection(rawHost: string, token: string): Promise<HATestResult> {
  const empty = { total: 0, counts: {} as Record<string, number> };
  const { host, secure } = normalizeHost(rawHost);
  if (!host) return { ok: false, error: 'Informe o IP do Home Assistant.', ...empty };
  if (!token.trim()) return { ok: false, error: 'Informe o token de acesso.', ...empty };
  const headers = { Authorization: `Bearer ${token.trim()}` };

  // No explicit port typed: try the browser default (80/443) and then 8123
  const typedPort = /:\d+$/.test(rawHost.trim().replace(/\/+$/, ''));
  const bare = host.replace(/:\d+$/, '');
  const candidates = typedPort || secure ? [host] : [bare, `${bare}:8123`];

  for (const candidate of candidates) {
    const base = `${secure ? 'https' : 'http'}://${candidate}`;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 5000);
    try {
      const cfgRes = await fetch(`${base}/api/config`, { headers, signal: ctrl.signal });
      if (cfgRes.status === 401) {
        return { ok: false, host: candidate, error: `Home Assistant encontrado em ${candidate}, mas o token é inválido ou foi revogado. Gere um novo em Perfil > Segurança > Tokens de acesso de longa duração.`, ...empty };
      }
      if (!cfgRes.ok) continue;
      const cfg = await cfgRes.json();
      const statesRes = await fetch(`${base}/api/states`, { headers, signal: ctrl.signal });
      const states: HAEntityState[] = statesRes.ok ? await statesRes.json() : [];
      const counts: Record<string, number> = {};
      states.forEach((e) => {
        const d = e.entity_id.split('.')[0];
        counts[d] = (counts[d] || 0) + 1;
      });
      return { ok: true, host: candidate, version: cfg.version, locationName: cfg.location_name, total: states.length, counts };
    } catch {
      // network error / timeout: try next candidate
    } finally {
      window.clearTimeout(timer);
    }
  }
  return { ok: false, error: `Não foi possível alcançar ${candidates.join(' nem ')}. Verifique o IP e se está na mesma rede.`, ...empty };
}

class HAWebSocketClient {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private config: HAConnectionConfig | null = null;
  private stateChangeListeners: Set<StateChangeCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private entities: Map<string, HAEntityState> = new Map();
  private reconnectTimer: number | null = null;
  private isIntentionalClose = false;
  private pingInterval: number | null = null;
  private lastPongTimestamp = Date.now();
  private reconnectAttempts = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkAndRecoverConnection();
        }
      });
      window.addEventListener('focus', () => {
        this.checkAndRecoverConnection();
      });
      window.addEventListener('online', () => {
        this.checkAndRecoverConnection();
      });
    }
  }

  private checkAndRecoverConnection() {
    if (this.config && !this.isIntentionalClose && !this.config.useDemoMode) {
      const isDead =
        !this.ws ||
        this.ws.readyState === WebSocket.CLOSED ||
        this.ws.readyState === WebSocket.CLOSING ||
        Date.now() - this.lastPongTimestamp > 45000;

      if (isDead) {
        console.log('[Koti HA] App resumed/network change detected, auto-reconnecting...');
        this.connect(this.config);
      }
    }
  }

  private startPingHeartbeat() {
    this.stopPingHeartbeat();
    this.lastPongTimestamp = Date.now();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        if (Date.now() - this.lastPongTimestamp > 50000) {
          console.warn('[Koti HA] Ping timeout detected, recycling connection...');
          try {
            this.ws.close();
          } catch (_) {}
          return;
        }
        this.sendMessage({
          id: this.messageId++,
          type: 'ping',
        });
      }
    }, 25000);
  }

  private stopPingHeartbeat() {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public connect(config: HAConnectionConfig) {
    this.config = config;
    this.isIntentionalClose = false;

    if (config.useDemoMode) {
      this.notifyStatus('connected');
      return;
    }

    if (this.ws) {
      this.stopPingHeartbeat();
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }

    this.notifyStatus('connecting');

    // Normalize URL
    const { host: cleanHost, secure: isHttps } = normalizeHost(config.host);
    const wsProtocol = isHttps ? 'wss' : 'ws';
    const httpProtocol = isHttps ? 'https' : 'http';
    const wsUrl = `${wsProtocol}://${cleanHost}/api/websocket`;

    // Immediate REST fetch to quickly populate entities without waiting
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
        this.stopPingHeartbeat();
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
    this.stopPingHeartbeat();
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
      this.reconnectAttempts = 0;
      this.startPingHeartbeat();
      this.fetchInitialStates();
      this.subscribeEvents();
    } else if (msg.type === 'pong') {
      this.lastPongTimestamp = Date.now();
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
      const { host: cleanHost, secure: isHttps } = normalizeHost(this.config.host);
      const httpProtocol = isHttps ? 'https' : 'http';
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
    this.reconnectAttempts++;
    const delay = Math.min(2000 * Math.pow(1.5, Math.min(this.reconnectAttempts, 4)), 10000);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (this.config && !this.isIntentionalClose) {
        this.connect(this.config);
      }
    }, delay);
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
