import React, { useState } from 'react';
import {
  Sofa,
  Armchair,
  Tv,
  UtensilsCrossed,
  Utensils,
  Coffee,
  Wine,
  Monitor,
  Laptop,
  Briefcase,
  Shirt,
  Sparkles,
  Bed,
  BedDouble,
  Bath,
  ShowerHead,
  Car,
  Trees,
  Sun,
  Flower2,
  DoorOpen,
  Key,
  Waves,
  Dumbbell,
  Star,
  Plus,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { RoomConfig, WidgetConfig } from '../../types/dashboard';
import { HAEntityState } from '../../types/homeAssistant';

interface RoomsViewProps {
  rooms: RoomConfig[];
  widgets: WidgetConfig[];
  entities: Record<string, HAEntityState>;
  isEditMode: boolean;
  accentColor?: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: (name: string, icon: string) => void;
  onUpdateRoom: (roomId: string, updates: Partial<Omit<RoomConfig, 'id'>>) => void;
  onDeleteRoom: (roomId: string) => void;
}

const ROOM_ICON_MAP: Record<string, any> = {
  Star,
  Sofa,
  Armchair,
  Tv,
  UtensilsCrossed,
  Utensils,
  Coffee,
  Wine,
  Monitor,
  Laptop,
  Briefcase,
  Shirt,
  Sparkles,
  Bed,
  BedDouble,
  Bath,
  ShowerHead,
  Car,
  Trees,
  Sun,
  Flower2,
  DoorOpen,
  Key,
  Waves,
  Dumbbell,
};

const AVAILABLE_ICONS = [
  { name: 'Sofa', label: 'Sala de Estar', Icon: Sofa },
  { name: 'Tv', label: 'TV / Cinema', Icon: Tv },
  { name: 'UtensilsCrossed', label: 'Sala de Jantar', Icon: UtensilsCrossed },
  { name: 'Utensils', label: 'Cozinha', Icon: Utensils },
  { name: 'Coffee', label: 'Café', Icon: Coffee },
  { name: 'Monitor', label: 'Escritório', Icon: Monitor },
  { name: 'Laptop', label: 'Trabalho', Icon: Laptop },
  { name: 'Shirt', label: 'Lavanderia', Icon: Shirt },
  { name: 'Bed', label: 'Quarto', Icon: Bed },
  { name: 'BedDouble', label: 'Quarto Casal', Icon: BedDouble },
  { name: 'Bath', label: 'Banheiro', Icon: Bath },
  { name: 'Car', label: 'Garagem', Icon: Car },
  { name: 'Trees', label: 'Jardim', Icon: Trees },
  { name: 'Sun', label: 'Varanda', Icon: Sun },
  { name: 'DoorOpen', label: 'Entrada / Hall', Icon: DoorOpen },
  { name: 'Waves', label: 'Piscina', Icon: Waves },
  { name: 'Dumbbell', label: 'Academia', Icon: Dumbbell },
];

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  widgets,
  entities,
  isEditMode,
  accentColor = '#2C75FF',
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('Sofa');

  const [isAdding, setIsAdding] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomIcon, setNewRoomIcon] = useState('Sofa');

  const handleStartEdit = (room: RoomConfig) => {
    setEditingRoomId(room.id);
    setEditName(room.name);
    setEditIcon(room.icon);
  };

  const handleSaveEdit = (roomId: string) => {
    if (editName.trim()) {
      onUpdateRoom(roomId, {
        name: editName.trim(),
        icon: editIcon,
      });
    }
    setEditingRoomId(null);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim(), newRoomIcon);
    setNewRoomName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 max-w-[1920px] mx-auto w-full animate-in fade-in duration-300">
      {/* Top Navigation Bar: Quick Return to Favorites/Dashboard */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => onSelectRoom('favorites')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full oneui-glass text-xs font-medium text-slate-300 hover:text-white transition-all duration-200 hover:border-white/20 active:scale-95 border border-white/10 shadow-sm"
        >
          <ChevronRight size={16} className="rotate-180" />
          <span>Voltar ao Dashboard</span>
        </button>

        {!isEditMode && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-blue-400 hover:text-white hover:bg-blue-600/20 transition-all border border-blue-500/20"
          >
            <Plus size={14} />
            <span>Novo Cômodo</span>
          </button>
        )}
      </div>

      {/* Header Info when in Edit Mode */}
      {isEditMode && (
        <div className="p-4 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-300 text-xs">
            <Edit2 size={16} />
            <span>Modo de Edição de Cômodos: renomeie, altere ícones ou remova cômodos.</span>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1 shrink-0"
          >
            <Plus size={14} />
            Novo Cômodo
          </button>
        </div>
      )}

      {/* Add New Room Form Card (when triggered) */}
      {isAdding && (
        <form
          onSubmit={handleCreateRoom}
          className="p-5 rounded-[28px] bg-slate-900/90 border border-blue-500/50 backdrop-blur-2xl shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Criar Novo Cômodo</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Nome do Cômodo
            </label>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Ex: Escritório, Varanda Gourmet, Lavanderia..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
              Ícone
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-36 overflow-y-auto pr-1">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.Icon;
                const isSelected = newRoomIcon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setNewRoomIcon(item.name)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <IconComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={!newRoomName.trim()}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 shadow-lg shadow-blue-500/30"
            >
              Adicionar Cômodo
            </button>
          </div>
        </form>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {rooms.map((room) => {
          const isFavorites = room.id === 'favorites';
          const roomWidgets = isFavorites
            ? widgets.filter((w) => w.isFavorite)
            : widgets.filter((w) => w.roomId === room.id);

          const activeCount = roomWidgets.filter((w) => {
            const ent = entities[w.entityId];
            return ent?.state === 'on' || (ent?.entity_id.startsWith('climate.') && ent?.state !== 'off');
          }).length;

          const IconComponent = ROOM_ICON_MAP[room.icon] || Sofa;
          const isEditingThis = editingRoomId === room.id;

          if (isEditingThis) {
            return (
              <div
                key={room.id}
                className="p-5 rounded-[28px] bg-slate-900/90 border border-blue-500/60 shadow-xl space-y-3.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Nome do cômodo"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(room.id)}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
                    title="Salvar"
                  >
                    <Check size={16} />
                  </button>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-1">Alterar Ícone</span>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {AVAILABLE_ICONS.map((item) => {
                      const IconItem = item.Icon;
                      const isSel = editIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setEditIcon(item.name)}
                          className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                            isSel
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <IconItem size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={room.id}
              onClick={() => {
                if (!isEditMode) {
                  onSelectRoom(room.id);
                }
              }}
              className={`p-5 rounded-[28px] oneui-glass border border-white/10 shadow-lg flex items-center justify-between transition-all duration-200 ${
                !isEditMode
                  ? 'cursor-pointer hover:border-white/25 hover:scale-[1.01] active:scale-[0.98]'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    color: accentColor,
                  }}
                >
                  <IconComponent size={24} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-light text-white truncate">{room.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{roomWidgets.length} aparelhos</span>
                    {activeCount > 0 && (
                      <span className="text-emerald-400 font-medium">• {activeCount} ativos</span>
                    )}
                  </div>
                </div>
              </div>

              {isEditMode ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartEdit(room)}
                    className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    title="Renomear e Mudar Ícone"
                  >
                    <Edit2 size={16} />
                  </button>
                  {!isFavorites && (
                    <button
                      onClick={() => {
                        if (confirm(`Excluir o cômodo "${room.name}"? Os dispositivos serão mantidos.`)) {
                          onDeleteRoom(room.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                      title="Excluir Cômodo"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-slate-500">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
