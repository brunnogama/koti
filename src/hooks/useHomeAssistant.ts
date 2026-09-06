import { useState, useEffect, useCallback } from 'react';
import { HAEntityState, HAConnectionConfig } from '../types/homeAssistant';
import { haWebSocket } from '../services/haWebSocket';
import { storageService } from '../services/storageService';
import { INITIAL_MOCK_ENTITIES } from '../services/mockData';

export function useHomeAssistant() {
  const initialConfig = storageService.getHAConfig();
  const [entities, setEntities] = useState<Record<string, HAEntityState>>(
    initialConfig.useDemoMode ? INITIAL_MOCK_ENTITIES : {}
  );
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'auth_failed'>('connecting');
  const [config, setConfig] = useState<HAConnectionConfig>(initialConfig);

  useEffect(() => {
    // Only populate with mock entities if user explicitly chose demo mode
    if (config.useDemoMode) {
      haWebSocket.setEntities(INITIAL_MOCK_ENTITIES);
      setEntities(INITIAL_MOCK_ENTITIES);
    }

    // Listen to real-time state changes
    const unsubState = haWebSocket.onStateChange((entityId, newState) => {
      setEntities((prev) => ({
        ...prev,
        [entityId]: newState,
      }));
    });

    // Listen to connection status
    const unsubStatus = haWebSocket.onStatus((status) => {
      setConnectionStatus(status);
    });

    // Connect
    haWebSocket.connect(config);

    return () => {
      unsubState();
      unsubStatus();
    };
  }, [config]);

  const updateConfig = useCallback((newConfig: HAConnectionConfig) => {
    storageService.saveHAConfig(newConfig);
    setConfig(newConfig);
    haWebSocket.connect(newConfig);
  }, []);

  const callService = useCallback((domain: string, service: string, serviceData: Record<string, any> = {}) => {
    haWebSocket.callService(domain, service, serviceData);
  }, []);

  const toggleEntity = useCallback((entityId: string) => {
    const entity = entities[entityId];
    if (!entity) return;

    const [domain] = entityId.split('.');
    if (domain === 'light' || domain === 'switch') {
      const nextService = entity.state === 'on' ? 'turn_off' : 'turn_on';
      callService(domain, nextService, { entity_id: entityId });
    } else if (domain === 'scene') {
      callService('scene', 'turn_on', { entity_id: entityId });
    }
  }, [entities, callService]);

  const setBrightness = useCallback((entityId: string, brightnessPercent: number) => {
    const rawVal = Math.round((brightnessPercent / 100) * 255);
    callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: rawVal,
    });
  }, [callService]);

  const setLightColor = useCallback((entityId: string, rgb: [number, number, number]) => {
    callService('light', 'turn_on', {
      entity_id: entityId,
      rgb_color: rgb,
    });
  }, [callService]);

  const setTemperature = useCallback((entityId: string, temp: number) => {
    callService('climate', 'set_temperature', {
      entity_id: entityId,
      temperature: temp,
    });
  }, [callService]);

  return {
    entities,
    connectionStatus,
    config,
    updateConfig,
    callService,
    toggleEntity,
    setBrightness,
    setLightColor,
    setTemperature,
  };
}
