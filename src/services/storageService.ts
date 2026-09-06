import { DashboardLayout } from '../types/dashboard';
import { HAConnectionConfig } from '../types/homeAssistant';
import { DEFAULT_DASHBOARD_LAYOUT, MOCK_ENTITY_IDS } from './mockData';

const STORAGE_KEYS = {
  LAYOUT: 'koti_dashboard_layout_v1',
  HA_CONFIG: 'koti_ha_connection_config',
};

export const storageService = {
  getLayout(): DashboardLayout {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out any leftover fake mock buttons
        const cleanWidgets = (parsed.widgets || []).filter(
          (w: any) => !MOCK_ENTITY_IDS.has(w.entityId)
        );

        const hasWeather = cleanWidgets.some((w: any) => w.entityId.startsWith('weather.'));
        const widgets = hasWeather
          ? cleanWidgets
          : [
              {
                id: 'w_weather',
                entityId: 'weather.local',
                roomId: 'living_room',
                size: '2x1',
                order: 0,
                isFavorite: true,
                customColor: '#06B6D4',
              },
              ...cleanWidgets,
            ];

        return {
          ...DEFAULT_DASHBOARD_LAYOUT,
          ...parsed,
          userName: parsed.userName || 'Bruno',
          widgets,
        };
      }
    } catch (e) {
      console.error('Failed to load dashboard layout from localStorage', e);
    }
    return DEFAULT_DASHBOARD_LAYOUT;
  },


  saveLayout(layout: DashboardLayout): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, JSON.stringify(layout));
    } catch (e) {
      console.error('Failed to save dashboard layout to localStorage', e);
    }
  },

  getHAConfig(): HAConnectionConfig {
    const DEFAULT_HA: HAConnectionConfig = {
      host: '10.0.0.32',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkOTNkYzMzNThhNjM0Yjk5YTI2NTBmNmQ3YzBjZmE2YSIsImlhdCI6MTc4ODY2NDE3MSwiZXhwIjoyMTA0MDI0MTcxfQ.Lw1amud6b6Fs3moZXlfIYzVe21aT4DFeve-fanx6cXA',
      useDemoMode: false,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HA_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          host: parsed.host || DEFAULT_HA.host,
          token: parsed.token || DEFAULT_HA.token,
          useDemoMode: parsed.useDemoMode !== undefined ? parsed.useDemoMode : false,
        };
      }
    } catch (e) {
      console.error('Failed to load HA config from localStorage', e);
    }
    return DEFAULT_HA;
  },

  saveHAConfig(config: HAConnectionConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HA_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save HA config to localStorage', e);
    }
  },

  exportLayoutJson(): string {
    const layout = this.getLayout();
    return JSON.stringify(layout, null, 2);
  },

  importLayoutJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.rooms && parsed.widgets) {
        this.saveLayout(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON for dashboard layout', e);
    }
    return false;
  },

  resetLayout(): DashboardLayout {
    this.saveLayout(DEFAULT_DASHBOARD_LAYOUT);
    return DEFAULT_DASHBOARD_LAYOUT;
  },
};
