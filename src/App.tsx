import React, { useState, useMemo, useEffect } from 'react';
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
import { RoomManagerModal } from './components/dashboard/RoomManagerModal';
import { WallClockAmbient } from './components/dashboard/WallClockAmbient';
import { WidgetConfig, WeatherData } from './types/dashboard';
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
    toggleFavorite,
    updateWidgetConfig,
    removeWidget,
    addWidget,
    addRoom,
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
  const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [currentNavTab, setCurrentNavTab] = useState<'home' | 'rooms' | 'automations' | 'settings'>('home');

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

  // Cycle widget size: 1x1 -> 2x1 -> 2x2 -> 1x1
  const cycleWidgetSize = (w: WidgetConfig) => {
    const nextSize = w.size === '1x1' ? '2x1' : w.size === '2x1' ? '2x2' : '1x1';
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
        subtitle={`${currentRoom.name} • ${activeCount} aparelhos ativos`}
        weather={weather}
        activeDevicesCount={activeCount}
        connectionStatus={connectionStatus}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isTV={isTV}
        onToggleTVMode={toggleForceTVMode}
      />

      {/* Room Tabs Pills */}
      <OneUIPill
        rooms={layout.rooms}
        activeRoomId={activeRoomId}
        onSelectRoom={(id) => setActiveRoomId(id)}
        onManageRooms={() => setIsRoomManagerOpen(true)}
        accentColor={layout.theme.accentColor}
      />

      {/* Main Responsive Grid Area */}
      <main className="flex-1 px-6 md:px-10 pb-28 md:pb-12 max-w-7xl w-full mx-auto">
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

            if (domain === 'weather') {
              return (
                <WeatherWidget
                  key={w.id}
                  config={w}
                  weather={weather}
                  isEditMode={isEditMode}
                  onRefresh={fetchWeather}
                  onResize={() => cycleWidgetSize(w)}
                  onMovePrev={() => moveWidget(w.id, 'prev')}
                  onMoveNext={() => moveWidget(w.id, 'next')}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            if (domain === 'light') {
              return (
                <LightWidget
                  key={w.id}
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onToggle={() => toggleEntity(w.entityId)}
                  onBrightnessChange={(val) => setBrightness(w.entityId, val)}
                  onResize={() => cycleWidgetSize(w)}
                  onMovePrev={() => moveWidget(w.id, 'prev')}
                  onMoveNext={() => moveWidget(w.id, 'next')}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            if (domain === 'switch') {
              return (
                <SwitchWidget
                  key={w.id}
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onToggle={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onMovePrev={() => moveWidget(w.id, 'prev')}
                  onMoveNext={() => moveWidget(w.id, 'next')}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            if (domain === 'climate') {
              return (
                <ClimateWidget
                  key={w.id}
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onSetTemperature={(temp) => setTemperature(w.entityId, temp)}
                  onTogglePower={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onMovePrev={() => moveWidget(w.id, 'prev')}
                  onMoveNext={() => moveWidget(w.id, 'next')}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            if (domain === 'scene') {
              return (
                <SceneWidget
                  key={w.id}
                  config={w}
                  entity={entity}
                  isEditMode={isEditMode}
                  onTrigger={() => toggleEntity(w.entityId)}
                  onResize={() => cycleWidgetSize(w)}
                  onMovePrev={() => moveWidget(w.id, 'prev')}
                  onMoveNext={() => moveWidget(w.id, 'next')}
                  onToggleFavorite={() => toggleFavorite(w.id)}
                  onEdit={() => setEditingWidget(w)}
                  onDelete={() => removeWidget(w.id)}
                />
              );
            }

            // Default fallback is SensorWidget for sensors and binary_sensors
            return (
              <SensorWidget
                key={w.id}
                config={w}
                entity={entity}
                isEditMode={isEditMode}
                onResize={() => cycleWidgetSize(w)}
                onMovePrev={() => moveWidget(w.id, 'prev')}
                onMoveNext={() => moveWidget(w.id, 'next')}
                onToggleFavorite={() => toggleFavorite(w.id)}
                onEdit={() => setEditingWidget(w)}
                onDelete={() => removeWidget(w.id)}
              />
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
        </div>

        {currentWidgets.length === 0 && !isEditMode && (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-sm">Nenhum aparelho adicionado a este cômodo ainda.</p>
            <button
              onClick={() => setIsEditMode(true)}
              className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-blue-600 text-white"
            >
              Personalizar e Adicionar
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentNavTab}
        onSelectTab={(tab) => {
          setCurrentNavTab(tab);
          if (tab === 'home') setActiveRoomId('favorites');
          if (tab === 'rooms') setIsRoomManagerOpen(true);
          if (tab === 'settings') setIsSettingsOpen(true);
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

      <RoomManagerModal
        isOpen={isRoomManagerOpen}
        rooms={layout.rooms}
        onClose={() => setIsRoomManagerOpen(false)}
        onAddRoom={addRoom}
        onDeleteRoom={removeRoom}
      />
    </div>
  );
}

export default App;
