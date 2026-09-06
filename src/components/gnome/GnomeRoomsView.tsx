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
  X,
} from 'lucide-react';
import { RoomConfig, WidgetConfig } from '../../types/dashboard';
import { HAEntityState } from '../../types/homeAssistant';

interface GnomeRoomsViewProps {
  rooms: RoomConfig[];
  widgets: WidgetConfig[];
  entities: Record<string, HAEntityState>;
  isEditMode: boolean;
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
  { name: 'Sofa', label: 'Sala de Estar', icon: Sofa },
  { name: 'Tv', label: 'Sala de TV', icon: Tv },
  { name: 'Utensils', label: 'Cozinha', icon: Utensils },
  { name: 'UtensilsCrossed', label: 'Sala de Jantar', icon: UtensilsCrossed },
  { name: 'Bed', label: 'Quarto', icon: Bed },
  { name: 'Bath', label: 'Banheiro', icon: Bath },
  { name: 'Monitor', label: 'Escritório', icon: Monitor },
  { name: 'Shirt', label: 'Lavanderia', icon: Shirt },
  { name: 'Car', label: 'Garagem', icon: Car },
  { name: 'Trees', label: 'Jardim', icon: Trees },
  { name: 'Waves', label: 'Piscina', icon: Waves },
  { name: 'Dumbbell', label: 'Academia', icon: Dumbbell },
];

export const GnomeRoomsView: React.FC<GnomeRoomsViewProps> = ({
  rooms,
  widgets,
  isEditMode,
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) => {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('Sofa');

  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Sofa');

  const handleStartEdit = (room: RoomConfig) => {
    setEditingRoomId(room.id);
    setEditName(room.name);
    setEditIcon(room.icon || 'Sofa');
  };

  const handleSaveEdit = (roomId: string) => {
    if (!editName.trim()) return;
    onUpdateRoom(roomId, { name: editName.trim(), icon: editIcon });
    setEditingRoomId(null);
  };

  const handleCreateRoom = () => {
    if (!newName.trim()) return;
    onAddRoom(newName.trim(), newIcon);
    setNewName('');
    setNewIcon('Sofa');
    setIsAddingRoom(false);
  };

  return (
    <div className="max-w-3xl mx-auto w-full py-6 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Gerenciamento de Cômodos</h2>
          <p className="text-xs text-white/60 mt-0.5">
            Organize os ambientes e dispositivos da sua residência
          </p>
        </div>

        <button
          onClick={() => setIsAddingRoom(true)}
          className="adw-btn adw-btn-suggested flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>Novo Cômodo</span>
        </button>
      </div>

      {/* Add room modal/card */}
      {isAddingRoom && (
        <div className="adw-card p-5 space-y-4 border-[#3584e4]/50 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white">Adicionar Novo Cômodo</h3>
            <button
              onClick={() => setIsAddingRoom(false)}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Nome do Cômodo</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Sala de Cinema, Varanda Gourmet..."
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-sm text-white focus:border-[#3584e4] focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">Ícone Representativo</label>
              <div className="grid grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map(({ name: iconKey, icon: IconComp }) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setNewIcon(iconKey)}
                    className={`p-2.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                      newIcon === iconKey
                        ? 'bg-[#3584e4] text-white shadow-md'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingRoom(false)}
              className="adw-btn adw-btn-flat text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={!newName.trim()}
              className="adw-btn adw-btn-suggested text-xs disabled:opacity-40"
            >
              Salvar Cômodo
            </button>
          </div>
        </div>
      )}

      {/* PreferencesGroup for Rooms */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-1">
          Cômodos Ativos ({rooms.length})
        </span>

        <div className="adw-card overflow-hidden divide-y divide-white/[0.06]">
          {rooms.map((room) => {
            const IconComponent = ROOM_ICON_MAP[room.icon] || Sofa;
            const roomWidgets = widgets.filter((w) => w.roomId === room.id);
            const isEditing = editingRoomId === room.id;

            if (isEditing) {
              return (
                <div key={room.id} className="p-4 bg-white/[0.04] space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-sm text-white focus:border-[#3584e4] focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(room.id)}
                      className="p-2 rounded-lg bg-[#3584e4] text-white hover:bg-[#438de6]"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingRoomId(null)}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/15"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-1.5 pt-1">
                    {AVAILABLE_ICONS.map(({ name: iconKey, icon: IconComp }) => (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setEditIcon(iconKey)}
                        className={`p-2 rounded-md flex items-center justify-center ${
                          editIcon === iconKey
                            ? 'bg-[#3584e4] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <IconComp size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#3584e4] shrink-0 group-hover:scale-105 transition-transform">
                    <IconComponent size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{room.name}</div>
                    <div className="text-xs text-white/50">
                      {roomWidgets.length}{' '}
                      {roomWidgets.length === 1 ? 'dispositivo' : 'dispositivos'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {isEditMode ? (
                    <>
                      <button
                        onClick={() => handleStartEdit(room)}
                        title="Editar nome ou ícone"
                        className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room.id)}
                        title="Remover cômodo"
                        className="p-2 rounded-md text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center text-white/40 group-hover:text-white/80 transition-colors pr-1">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
