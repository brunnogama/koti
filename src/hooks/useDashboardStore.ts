import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout, WidgetConfig, RoomConfig, ThemeConfig, WidgetSize } from '../types/dashboard';
import { storageService } from '../services/storageService';

export function useDashboardStore() {
  const [layout, setLayout] = useState<DashboardLayout>(storageService.getLayout());
  const [activeRoomId, setActiveRoomId] = useState<string>('favorites');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isScreensaverActive, setIsScreensaverActive] = useState<boolean>(false);

  // Auto-save whenever layout changes
  const saveCurrentLayout = useCallback((newLayout: DashboardLayout) => {
    setLayout(newLayout);
    storageService.saveLayout(newLayout);
  }, []);

  // Idle timer for Screensaver mode (especially great for Wall Tablets)
  useEffect(() => {
    if (layout.screensaverTimeoutMinutes <= 0) return;

    let timeoutId: number;

    const resetIdleTimer = () => {
      if (isScreensaverActive) {
        setIsScreensaverActive(false);
      }
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsScreensaverActive(true);
      }, layout.screensaverTimeoutMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
    };
  }, [layout.screensaverTimeoutMinutes, isScreensaverActive]);

  const updateWidgetSize = useCallback((widgetId: string, size: WidgetSize) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) => (w.id === widgetId ? { ...w, size } : w)),
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const moveWidget = useCallback((widgetId: string, direction: 'prev' | 'next') => {
    const roomWidgets = layout.widgets.filter((w) =>
      activeRoomId === 'favorites' ? w.isFavorite : w.roomId === activeRoomId
    );
    const index = roomWidgets.findIndex((w) => w.id === widgetId);
    if (index === -1) return;

    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= roomWidgets.length) return;

    const currentW = roomWidgets[index];
    const targetW = roomWidgets[targetIndex];

    // Swap orders
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) => {
        if (w.id === currentW.id) return { ...w, order: targetW.order };
        if (w.id === targetW.id) return { ...w, order: currentW.order };
        return w;
      }),
    };
    saveCurrentLayout(updated);
  }, [layout, activeRoomId, saveCurrentLayout]);

  const toggleFavorite = useCallback((widgetId: string) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) => (w.id === widgetId ? { ...w, isFavorite: !w.isFavorite } : w)),
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const updateWidgetConfig = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const removeWidget = useCallback((widgetId: string) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.filter((w) => w.id !== widgetId),
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const addWidget = useCallback((widget: Omit<WidgetConfig, 'id' | 'order'>) => {
    const newId = 'w_' + Date.now();
    const newWidget: WidgetConfig = {
      ...widget,
      id: newId,
      order: layout.widgets.length,
    };
    const updated = {
      ...layout,
      widgets: [...layout.widgets, newWidget],
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const addRoom = useCallback((name: string, icon: string) => {
    const newRoom: RoomConfig = {
      id: 'room_' + Date.now(),
      name,
      icon,
      order: layout.rooms.length,
    };
    const updated = {
      ...layout,
      rooms: [...layout.rooms, newRoom],
    };
    saveCurrentLayout(updated);
    setActiveRoomId(newRoom.id);
  }, [layout, saveCurrentLayout]);

  const removeRoom = useCallback((roomId: string) => {
    if (roomId === 'favorites') return;
    const updated = {
      ...layout,
      rooms: layout.rooms.filter(r => r.id !== roomId),
      widgets: layout.widgets.filter(w => w.roomId !== roomId),
    };
    saveCurrentLayout(updated);
    if (activeRoomId === roomId) {
      setActiveRoomId('favorites');
    }
  }, [layout, activeRoomId, saveCurrentLayout]);

  const updateTheme = useCallback((theme: Partial<ThemeConfig>) => {
    const updated = {
      ...layout,
      theme: {
        ...layout.theme,
        ...theme,
      },
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const updateUserConfig = useCallback((userName: string, city?: string) => {
    const updated = {
      ...layout,
      userName: userName.trim() || 'Bruno',
      city: city !== undefined ? city.trim() : layout.city,
    };
    saveCurrentLayout(updated);
  }, [layout, saveCurrentLayout]);

  const resetToDefault = useCallback(() => {
    const def = storageService.resetLayout();
    setLayout(def);
    setActiveRoomId('favorites');
  }, []);

  return {
    layout,
    activeRoomId,
    setActiveRoomId,
    isEditMode,
    setIsEditMode,
    isScreensaverActive,
    setIsScreensaverActive,
    updateWidgetSize,
    moveWidget,
    toggleFavorite,
    updateWidgetConfig,
    removeWidget,
    addWidget,
    addRoom,
    removeRoom,
    updateTheme,
    updateUserConfig,
    resetToDefault,
  };
}

