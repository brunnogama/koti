import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useHomeAssistant } from './hooks/useHomeAssistant';
import { useDeviceType } from './hooks/useDeviceType';
import { useDashboardStore } from './hooks/useDashboardStore';
import { weatherService } from './services/weatherService';
import { OneUIHeader } from './components/oneui/OneUIHeader';
import { OneUIPill } from './components/oneui/OneUIPill';
import { BottomNav } from './components/oneui/BottomNav';
import { LightWidget } from './components/widgets/LightWidget';
import { SwitchWidget } from './components/widgets/SwitchWidget';
import { SensorWidget } from './components/widgets/SensorWidget';
import { ClimateWidget } from './components/widgets/ClimateWidget';
import { SceneWidget } from './components/widgets/SceneWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { SettingsModal } from './components/settings/SettingsModal';
import { EditWidgetModal } from './components/dashboard/EditWidgetModal';
import { AddWidgetModal } from './components/dashboard/AddWidgetModal';
import { WallClockAmbient } from './components/dashboard/WallClockAmbient';
import { WidgetConfig, WeatherData } from './types/dashboard';
import { RoomsView } from './components/views/RoomsView';
import { ScenesView } from './components/views/ScenesView';
import { MOCK_ENTITY_IDS } from './services/mockData';
import { Plus } from 'lucide-react';

export function App() {
  const {
    entities,
    connectionStatus,
    config: haConfig,
    updateConfig: onSaveHAConfig,
    toggleEntity,
    setBrightness,
    setTemperature,
  } = useHomeAssistant();

  const { isMobile, isTablet, isTV, toggleForceTVMode } = useDeviceType();

  const {
    layout,
    activeRoomId,
    setActiveRoomId,
    isEditMode,
    setIsEditMode,
    isScreensaverActive,
    setIsScreensaverActive,
    updateWidgetSize,
    moveWidget,
    reorderWidgets,
    toggleFavorite,
    updateWidgetConfig,
    removeWidget,
    addWidget,
    addRoom,
    updateRoom,
    removeRoom,
    updateTheme,
    updateUserConfig,
    resetToDefault,
  } = useDashboardStore();

  // Weather state
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    apparentTemperature: 25,
    conditionCode: 2,
    conditionText: 'Parcialmente Nublado',
    cityName: layout.city || 'Sua Região',
    humidity: 62,
    windSpeed: 14,
    tempMax: 28,
    tempMin: 19,
    isDay: true,
  });

  const fetchWeather = async () => {
    try {
      const data = await weatherService.getWeather(layout.city);
      setWeather(data);
    } catch (e) {
      console.warn('Could not refresh weather', e);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 20 minutes
    const interval = setInterval(fetchWeather, 20 * 60 * 1000);
    return () => clearInterval(interval);
  }, [layout.city]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [currentNavTab, setCurrentNavTab] = useState<'home' | 'rooms' | 'automations' | 'settings'>('home');

  // Drag & drop reorder state
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);
  const touchStartRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<any>(null);
  const isTouchDraggingRef = useRef<boolean>(false);

  // Filter widgets for current room
  const currentWidgets = useMemo(() => {
    return layout.widgets
      .filter((w) => (activeRoomId === 'favorites' ? w.isFavorite : w.roomId === activeRoomId))
      .sort((a, b) => a.order - b.order);
  }, [layout.widgets, activeRoomId]);

  // Count active devices for header
  const activeCount = useMemo(() => {
    return Object.values(entities).filter(
      (e) => e.state === 'on' || (e.entity_id.startsWith('climate.') && e.state !== 'off')
    ).length;
  }, [entities]);

  const activeLightsCount = useMemo(() => {
    return Object.values(entities).filter((e) => e.entity_id.startsWith('light.') && e.state === 'on').length;
  }, [entities]);

  const currentRoom = layout.rooms.find((r) => r.id === activeRoomId) || layout.rooms[0];

  const headerTitle = useMemo(() => {
    if (currentNavTab === 'rooms') return 'Cômodos';
    if (currentNavTab === 'automations') return 'Cenários';
    return undefined;
  }, [currentNavTab]);

  const headerSubtitle = useMemo(() => {
    if (currentNavTab === 'rooms') {
      return `${layout.rooms.length} cômodos cadastrados`;
    }
    if (currentNavTab === 'automations') {
      const realScenesCount = Object.values(entities).filter(
        (e) => e.entity_id.startsWith('scene.') && !MOCK_ENTITY_IDS.has(e.entity_id)
      ).length;
      return `${realScenesCount} cenários cadastrados no Home Assistant`;
    }
    return `${currentRoom.name} • ${activeCount} aparelhos ativos`;
  }, [currentNavTab, layout.rooms.length, currentRoom.name, activeCount, entities]);

  // Theme Background calculation
  const backgroundStyle = useMemo(() => {
    if (layout.theme.customWallpaperUrl) {
      return {
        backgroundImage: `url(${layout.theme.customWallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    switch (layout.theme.preset) {
      case 'amoled-black':
        return { backgroundColor: '#000000' };
      case 'cyber-night':
        return {
          background: 'radial-gradient(ellipse at 80% 20%, #0f2b48 0%, #080e1a 50%, #04070d 100%)',
        };
      case 'sunset-glow':
        return {
          background: 'radial-gradient(ellipse at 20% 10%, #3b1b2f 0%, #161022 50%, #08070d 100%)',
        };
      case 'oneui-light':
        return {
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
        };
      case 'oneui-dark':
      default:
        return {
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(44, 117, 255, 0.15) 0%, rgba(13, 15, 18, 0.8) 50%, #0d0f12 100%)',
        };
    }
  }, [layout.theme]);

  // Cycle widget size: pill -> 1x1 -> 2x1 -> 2x2 -> pill
  const cycleWidgetSize = (w: WidgetConfig) => {
    const nextSize = w.size === 'pill' ? '1x1' : w.size === '1x1' ? '2x1' : w.size === '2x1' ? '2x2' : 'pill';
    updateWidgetSize(w.id, nextSize);
  };

  // Export JSON handler
  const handleExportLayout = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(layout, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `koti_layout_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportLayout = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.rooms && parsed.widgets) {
        layout.widgets = parsed.widgets;
        layout.rooms = parsed.rooms;
        if (parsed.theme) layout.theme = parsed.theme;
        updateTheme(parsed.theme || {});
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <div
      style={backgroundStyle}
      className={`min-h-screen text-slate-100 flex flex-col transition-colors duration-500 relative ${
        layout.theme.preset === 'oneui-light' ? 'text-slate-900' : ''
      }`}
    >
      {/* Ambient Screensaver (Wall Tablet Mode) */}
      {isScreensaverActive && (
        <WallClockAmbient
          activeLightsCount={activeLightsCount}
          weather={weather}
          onDismiss={() => setIsScreensaverActive(false)}
        />
      )}

      {/* Main Header in Samsung One UI Style with Dynamic Greeting & Weather */}
      <OneUIHeader
        userName={layout.userName}
        title={headerTitle}
        subtitle={headerSubtitle}
        weather={weather}
        activeDevicesCount={activeCount}
        connectionStatus={connectionStatus}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTV={isTV}
      />

      {/* Room Tabs Pills (only in Home tab) */}
      {currentNavTab === 'home' && (
        <OneUIPill
          rooms={layout.rooms}
          activeRoomId={activeRoomId}
          onSelectRoom={(id) => setActiveRoomId(id)}
          onManageRooms={() => setCurrentNavTab('rooms')}
          accentColor={layout.theme.accentColor}
        />
      )}

      {/* Main Responsive Grid Area */}
      <main className="flex-1 px-6 md:px-10 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
        {currentNavTab === 'rooms' ? (
          <RoomsView
            rooms={layout.rooms}
            widgets={layout.widgets}
            entities={entities}
            isEditMode={isEditMode}
            accentColor={layout.theme.accentColor}
            onSelectRoom={(id) => {
              setActiveRoomId(id);
              setCurrentNavTab('home');
            }}
            onAddRoom={addRoom}
            onUpdateRoom={updateRoom}
            onDeleteRoom={removeRoom}
          />
        ) : currentNavTab === 'automations' ? (
          <ScenesView
            entities={entities}
            widgets={layout.widgets}
            isEditMode={isEditMode}
            accentColor={layout.theme.accentColor}
            onTriggerScene={(id) => toggleEntity(id)}
            onAddSceneWidget={(sceneId, friendlyName) => {
              addWidget({
                entityId: sceneId,
                roomId: activeRoomId === 'favorites' ? 'living_room' : activeRoomId,
                size: '1x1',
                customName: friendlyName,
                isFavorite: true,
                customColor: '#8B5CF6',
              });
            }}
            onRemoveWidget={removeWidget}
          />
        ) : (
          <div
            className={`grid gap-4 sm:gap-5 transition-all duration-300 ${
              isMobile
                ? 'grid-cols-2'
                : isTablet
                ? 'grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
          {currentWidgets.map((w) => {
            const entity = entities[w.entityId];
            const domain = w.entityId.split('.')[0];

            let widgetNode = null;
            if (domain === 'weather') {
              widgetNode = (
                <WeatherWidget
                  config={w}
                  weather={weather}
                  isEditMode={isEditMode}
                  onRefresh={fetchWeather}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            } else if (domain === 'light') {
              widgetNode = (
                <LightWidget
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onToggle={() => toggleEntity(w.entityId)}
                  onBrightnessChange={(val) => setBrightness(w.entityId, val)}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            } else if (domain === 'switch') {
              widgetNode = (
                <SwitchWidget
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onToggle={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            } else if (domain === 'climate') {
              widgetNode = (
                <ClimateWidget
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onSetTemperature={(temp) => setTemperature(w.entityId, temp)}
                  onTogglePower={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            } else if (domain === 'scene') {
              widgetNode = (
                <SceneWidget
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onTrigger={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            } else {
              widgetNode = (
                <SensorWidget
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onResize={() => cycleWidgetSize(w)}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            const colSpanClass =
              w.size === '2x1'
                ? 'col-span-2'
                : w.size === '2x2'
                ? 'col-span-2 row-span-2'
                : 'col-span-1';

            return (
              <div
                key={w.id}
                data-widget-id={w.id}
                draggable={true}
                onDragStart={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.closest('input')) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.setData('text/plain', w.id);
                  setDraggedWidgetId(w.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverWidgetId !== w.id) {
                    setDragOverWidgetId(w.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverWidgetId === w.id) {
                    setDragOverWidgetId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain') || draggedWidgetId;
                  if (sourceId && sourceId !== w.id) {
                    reorderWidgets(sourceId, w.id);
                  }
                  setDraggedWidgetId(null);
                  setDragOverWidgetId(null);
                }}
                onDragEnd={() => {
                  setDraggedWidgetId(null);
                  setDragOverWidgetId(null);
                }}
                onTouchStart={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button') || target.closest('input')) return;
                  const touch = e.touches[0];
                  touchStartRef.current = {
                    id: w.id,
                    x: touch.clientX,
                    y: touch.clientY,
                  };
                  isTouchDraggingRef.current = false;
                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  longPressTimerRef.current = setTimeout(() => {
                    isTouchDraggingRef.current = true;
                    setDraggedWidgetId(w.id);
                    if (navigator.vibrate) navigator.vibrate(40);
                  }, 280);
                }}
                onTouchMove={(e) => {
                  if (!touchStartRef.current) return;
                  const touch = e.touches[0];
                  const dx = Math.abs(touch.clientX - touchStartRef.current.x);
                  const dy = Math.abs(touch.clientY - touchStartRef.current.y);

                  if (!isTouchDraggingRef.current) {
                    if (dx > 8 || dy > 8) {
                      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                    }
                    return;
                  }

                  if (e.cancelable) e.preventDefault();
                  const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
                  const cardContainer = targetEl?.closest('[data-widget-id]');
                  const targetId = cardContainer?.getAttribute('data-widget-id');
                  if (targetId && targetId !== touchStartRef.current.id) {
                    setDragOverWidgetId(targetId);
                  }
                }}
                onTouchEnd={() => {
                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  if (isTouchDraggingRef.current && dragOverWidgetId && touchStartRef.current?.id && dragOverWidgetId !== touchStartRef.current.id) {
                    reorderWidgets(touchStartRef.current.id, dragOverWidgetId);
                    if (navigator.vibrate) navigator.vibrate(30);
                  }
                  touchStartRef.current = null;
                  isTouchDraggingRef.current = false;
                  setDraggedWidgetId(null);
                  setDragOverWidgetId(null);
                }}
                onTouchCancel={() => {
                  if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  touchStartRef.current = null;
                  isTouchDraggingRef.current = false;
                  setDraggedWidgetId(null);
                  setDragOverWidgetId(null);
                }}
                className={`transition-all duration-200 ${colSpanClass} ${
                  draggedWidgetId === w.id ? 'opacity-40 scale-95' : ''
                } ${
                  dragOverWidgetId === w.id
                    ? 'ring-2 ring-blue-500/80 rounded-[28px] scale-[1.02] shadow-[0_0_25px_rgba(44,117,255,0.4)]'
                    : ''
                }`}
              >
                {widgetNode}
              </div>
            );
          })}

          {/* Add Widget Button Card when in Edit Mode */}
          {isEditMode && (
            <button
              onClick={() => setIsAddWidgetOpen(true)}
              className="h-36 rounded-[28px] border-2 border-dashed border-white/20 hover:border-blue-500/60 bg-white/5 hover:bg-blue-500/10 transition-all flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center">
                <Plus size={20} />
              </div>
              <span className="text-xs font-semibold">Adicionar Dispositivo</span>
            </button>
          )}
            {currentWidgets.length === 0 && !isEditMode && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 text-sm">Nenhum aparelho adicionado a este cômodo ainda.</p>
                <button
                  onClick={() => setIsAddWidgetOpen(true)}
                  className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all"
                >
                  Adicionar Dispositivo
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentNavTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
            return;
          }
          setCurrentNavTab(tab);
          if (tab === 'home') {
            setActiveRoomId('favorites');
          }
        }}
        accentColor={layout.theme.accentColor}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={layout.userName}
        city={layout.city}
        onUpdateUser={updateUserConfig}
        haConfig={haConfig}
        onSaveHAConfig={onSaveHAConfig}
        theme={layout.theme}
        onUpdateTheme={updateTheme}
        screensaverMinutes={layout.screensaverTimeoutMinutes}
        onUpdateScreensaver={(minutes) => {
          layout.screensaverTimeoutMinutes = minutes;
          updateTheme({});
        }}
        onExportLayout={handleExportLayout}
        onImportLayout={handleImportLayout}
        onResetLayout={resetToDefault}
      />

      {editingWidget && (
        <EditWidgetModal
          isOpen={true}
          widget={editingWidget}
          defaultName={entities[editingWidget.entityId]?.attributes?.friendly_name || editingWidget.entityId}
          rooms={layout.rooms}
          onClose={() => setEditingWidget(null)}
          onSave={(updates) => updateWidgetConfig(editingWidget.id, updates)}
        />
      )}

      <AddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAdd={addWidget}
        availableEntities={entities}
        currentRoomId={activeRoomId}
      />
    </div>
  );
}

export default App;
