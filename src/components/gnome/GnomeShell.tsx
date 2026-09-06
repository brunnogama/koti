import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Radio,
  Zap,
  Settings,
  Plus,
  Star,
  Sofa,
  Sparkles,
} from 'lucide-react';
import {
  WidgetConfig,
  RoomConfig,
  WeatherData,
  LayoutConfig,
} from '../../types/dashboard';
import {
  HAEntityState,
  ConnectionStatus,
  HAConfig,
} from '../../types/homeAssistant';
import { PlatformMode, PlatformType } from '../../hooks/usePlatform';
import { AdwHeaderBar, GnomeTab } from './AdwHeaderBar';
import { GnomeLightCard } from './widgets/GnomeLightCard';
import { GnomeSwitchCard } from './widgets/GnomeSwitchCard';
import { GnomeSensorCard } from './widgets/GnomeSensorCard';
import { GnomeClimateCard } from './widgets/GnomeClimateCard';
import { GnomeSceneCard } from './widgets/GnomeSceneCard';
import { GnomeWeatherCard } from './widgets/GnomeWeatherCard';
import { GnomeRoomsView } from './GnomeRoomsView';
import { GnomeScenesView } from './GnomeScenesView';
import { GnomeSettingsDialog } from './GnomeSettingsDialog';
import { AddWidgetModal } from '../dashboard/AddWidgetModal';
import { EditWidgetModal } from '../dashboard/EditWidgetModal';

interface GnomeShellProps {
  entities: Record<string, HAEntityState>;
  connectionStatus: ConnectionStatus;
  haConfig: HAConfig;
  onSaveHAConfig: (config: HAConfig) => void;
  toggleEntity: (entityId: string) => void;
  setBrightness: (entityId: string, brightness: number) => void;
  setTemperature: (entityId: string, temperature: number) => void;
  layout: LayoutConfig;
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  isEditMode: boolean;
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  updateWidgetSize: (id: string) => void;
  reorderWidgets: (draggedId: string, targetId: string) => void;
  toggleFavorite: (id: string) => void;
  updateWidgetConfig: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  addWidget: (config: Omit<WidgetConfig, 'id' | 'order'>) => void;
  addRoom: (name: string, icon: string) => void;
  updateRoom: (roomId: string, updates: Partial<Omit<RoomConfig, 'id'>>) => void;
  removeRoom: (roomId: string) => void;
  updateUserConfig: (userName: string, city?: string) => void;
  weather: WeatherData;
  fetchWeather: () => void;
  platformMode: PlatformMode;
  activePlatform: PlatformType;
  setPlatformMode: (mode: PlatformMode) => void;
}

export const GnomeShell: React.FC<GnomeShellProps> = ({
  entities,
  connectionStatus,
  haConfig,
  onSaveHAConfig,
  toggleEntity,
  setBrightness,
  setTemperature,
  layout,
  activeRoomId,
  setActiveRoomId,
  isEditMode,
  setIsEditMode,
  updateWidgetSize,
  reorderWidgets,
  toggleFavorite,
  updateWidgetConfig,
  removeWidget,
  addWidget,
  addRoom,
  updateRoom,
  removeRoom,
  updateUserConfig,
  weather,
  fetchWeather,
  platformMode,
  activePlatform,
  setPlatformMode,
}) => {
  const [currentTab, setCurrentTab] = useState<GnomeTab>('devices');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);

  // Drag & drop state for GNOME cards
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // Filter widgets by active room or favorite
  const filteredWidgets = useMemo(() => {
    if (activeRoomId === 'all') {
      return layout.widgets;
    }
    if (activeRoomId === 'favorites') {
      return layout.widgets.filter((w: WidgetConfig) => w.isFavorite);
    }
    return layout.widgets.filter((w: WidgetConfig) => w.roomId === activeRoomId);
  }, [layout.widgets, activeRoomId]);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    if (!isEditMode) return;
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    const sourceId = draggedWidgetId || e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      reorderWidgets(sourceId, targetId);
    }
    setDraggedWidgetId(null);
  };

  return (
    <div className="theme-gnome min-h-screen bg-[#242424] text-white flex flex-col font-sans select-none antialiased">
      {/* 1. Libadwaita HeaderBar */}
      <AdwHeaderBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        connectionStatus={connectionStatus}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onAddWidget={() => setIsAddWidgetOpen(true)}
        onRefresh={fetchWeather}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto">
        {/* TAB: DEVICES */}
        {currentTab === 'devices' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5 animate-in fade-in duration-200">
            {/* Room Filter Pills (Adwaita segmented pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveRoomId('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  activeRoomId === 'all'
                    ? 'bg-[#3584e4] text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                Todos ({layout.widgets.length})
              </button>

              <button
                onClick={() => setActiveRoomId('favorites')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  activeRoomId === 'favorites'
                    ? 'bg-[#3584e4] text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Star size={12} fill="currentColor" />
                <span>Favoritos</span>
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1 shrink-0" />

              {layout.rooms.map((room: RoomConfig) => {
                const count = layout.widgets.filter((w: WidgetConfig) => w.roomId === room.id).length;
                const isSelected = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#3584e4] text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{room.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] opacity-60 bg-black/20 px-1.5 py-0.2 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Widgets Responsive Grid */}
            {filteredWidgets.length === 0 ? (
              <div className="adw-card p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40 mx-auto">
                  <Sparkles size={24} />
                </div>
                <div className="text-sm font-medium text-white">Nenhum dispositivo encontrado</div>
                <div className="text-xs text-white/50 max-w-sm mx-auto">
                  Adicione dispositivos ao seu painel ou selecione outro cômodo na barra superior.
                </div>
                <button
                  onClick={() => setIsAddWidgetOpen(true)}
                  className="adw-btn adw-btn-suggested text-xs inline-flex items-center gap-1.5 mt-2"
                >
                  <Plus size={14} />
                  <span>Adicionar Primeiro Dispositivo</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredWidgets.map((widget: WidgetConfig) => {
                  const entity = widget.entityId ? entities[widget.entityId] : undefined;
                  const domain = widget.entityId.split('.')[0];

                  switch (domain) {
                    case 'light':
                      return (
                        <GnomeLightCard
                          key={widget.id}
                          config={widget}
                          entity={entity}
                          isEditMode={isEditMode}
                          onToggle={() => widget.entityId && toggleEntity(widget.entityId)}
                          onBrightnessChange={(val) =>
                            widget.entityId && setBrightness(widget.entityId, val)
                          }
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    case 'switch':
                      return (
                        <GnomeSwitchCard
                          key={widget.id}
                          config={widget}
                          entity={entity}
                          isEditMode={isEditMode}
                          onToggle={() => widget.entityId && toggleEntity(widget.entityId)}
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    case 'sensor':
                    case 'binary_sensor':
                      return (
                        <GnomeSensorCard
                          key={widget.id}
                          config={widget}
                          entity={entity}
                          isEditMode={isEditMode}
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    case 'climate':
                      return (
                        <GnomeClimateCard
                          key={widget.id}
                          config={widget}
                          entity={entity}
                          isEditMode={isEditMode}
                          onTemperatureChange={(val) =>
                            widget.entityId && setTemperature(widget.entityId, val)
                          }
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    case 'scene':
                      return (
                        <GnomeSceneCard
                          key={widget.id}
                          config={widget}
                          entity={entity}
                          isEditMode={isEditMode}
                          onActivate={() => widget.entityId && toggleEntity(widget.entityId)}
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    case 'weather':
                      return (
                        <GnomeWeatherCard
                          key={widget.id}
                          config={widget}
                          weather={weather}
                          isEditMode={isEditMode}
                          onResize={() => updateWidgetSize(widget.id)}
                          onToggleFavorite={() => toggleFavorite(widget.id)}
                          onEdit={() => setEditingWidget(widget)}
                          onDelete={() => removeWidget(widget.id)}
                          onDragStart={handleDragStart(widget.id)}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(widget.id)}
                        />
                      );

                    default:
                      return null;
                  }
                })}

                {/* Add Device Card in Edit Mode */}
                {isEditMode && (
                  <button
                    onClick={() => setIsAddWidgetOpen(true)}
                    className="adw-card p-6 min-h-[136px] flex flex-col items-center justify-center gap-2 border-dashed border-[#3584e4]/50 hover:border-[#3584e4] hover:bg-[#3584e4]/10 transition-all text-white/70 hover:text-white group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#3584e4]/20 flex items-center justify-center text-[#3584e4] group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs font-medium">Adicionar Dispositivo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: ROOMS */}
        {currentTab === 'rooms' && (
          <GnomeRoomsView
            rooms={layout.rooms}
            widgets={layout.widgets}
            entities={entities}
            isEditMode={isEditMode}
            onSelectRoom={(roomId) => {
              setActiveRoomId(roomId);
              setCurrentTab('devices');
            }}
            onAddRoom={addRoom}
            onUpdateRoom={updateRoom}
            onDeleteRoom={removeRoom}
          />
        )}

        {/* TAB: SCENES */}
        {currentTab === 'scenes' && (
          <GnomeScenesView
            entities={entities}
            widgets={layout.widgets}
            isEditMode={isEditMode}
            onTriggerScene={(entityId) => toggleEntity(entityId)}
            onAddSceneWidget={(sceneEntityId, friendlyName) => {
              addWidget({
                entityId: sceneEntityId,
                customName: friendlyName,
                size: '1x1',
                isFavorite: true,
                roomId: activeRoomId === 'favorites' ? 'all' : activeRoomId,
                customColor: '#8B5CF6',
              });
            }}
            onRemoveWidget={removeWidget}
          />
        )}
      </main>

      {/* 3. GNOME Dialogs */}
      <GnomeSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        haConfig={haConfig}
        connectionStatus={connectionStatus}
        onSaveHAConfig={onSaveHAConfig}
        platformMode={platformMode}
        activePlatform={activePlatform}
        onSelectPlatformMode={setPlatformMode}
        city={layout.city}
        onUpdateCity={(newCity) => updateUserConfig(layout.userName, newCity)}
      />

      {/* Shared Modals for Editing & Adding */}
      {isAddWidgetOpen && (
        <AddWidgetModal
          isOpen={isAddWidgetOpen}
          onClose={() => setIsAddWidgetOpen(false)}
          onAdd={addWidget}
          currentRoomId={activeRoomId}
          availableEntities={entities}
        />
      )}

      {editingWidget && (
        <EditWidgetModal
          isOpen={!!editingWidget}
          onClose={() => setEditingWidget(null)}
          widget={editingWidget}
          defaultName={
            entities[editingWidget.entityId]?.attributes?.friendly_name ||
            editingWidget.entityId
          }
          rooms={layout.rooms}
          onSave={(updates) => updateWidgetConfig(editingWidget.id, updates)}
        />
      )}
    </div>
  );
};
