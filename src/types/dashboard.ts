export type WidgetSize = '1x1' | '2x1' | '2x2';

export interface WidgetConfig {
  id: string;
  entityId: string;
  roomId: string;
  size: WidgetSize;
  order: number;
  customName?: string;
  customIcon?: string;
  customColor?: string; // Hex or theme token
  isFavorite?: boolean;
}

export interface RoomConfig {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export type ThemePreset = 'oneui-dark' | 'oneui-light' | 'amoled-black' | 'cyber-night' | 'sunset-glow';

export interface ThemeConfig {
  preset: ThemePreset;
  customWallpaperUrl?: string;
  blurStrength: 'low' | 'medium' | 'high';
  accentColor: string; // One UI Blue (#2C75FF), Amber (#FFB020), Emerald (#10B981), etc.
}

export interface DashboardLayout {
  version: number;
  rooms: RoomConfig[];
  widgets: WidgetConfig[];
  theme: ThemeConfig;
  screensaverTimeoutMinutes: number; // 0 = disabled
}
