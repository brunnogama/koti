import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sofa,
  Armchair,
  Bed,
  BedDouble,
  Utensils,
  UtensilsCrossed,
  Wine,
  Coffee,
  Monitor,
  Laptop,
  Briefcase,
  Shirt,
  Sparkles,
  Bath,
  ShowerHead,
  Tv,
  Car,
  Trees,
  Sun,
  Flower2,
  DoorOpen,
  Key,
  Waves,
  Dumbbell,
} from 'lucide-react';
import { RoomConfig } from '../../types/dashboard';

interface RoomManagerModalProps {
  rooms: RoomConfig[];
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (name: string, icon: string) => void;
  onDeleteRoom: (id: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Sofa', label: 'Sala de Estar', Icon: Sofa },
  { name: 'Armchair', label: 'Poltrona', Icon: Armchair },
  { name: 'Tv', label: 'TV / Cinema', Icon: Tv },
  { name: 'UtensilsCrossed', label: 'Sala de Jantar', Icon: UtensilsCrossed },
  { name: 'Utensils', label: 'Cozinha', Icon: Utensils },
  { name: 'Coffee', label: 'Café', Icon: Coffee },
  { name: 'Wine', label: 'Adega / Bar', Icon: Wine },
  { name: 'Monitor', label: 'Escritório', Icon: Monitor },
  { name: 'Laptop', label: 'Trabalho', Icon: Laptop },
  { name: 'Briefcase', label: 'Gabinete', Icon: Briefcase },
  { name: 'Shirt', label: 'Lavanderia', Icon: Shirt },
  { name: 'Sparkles', label: 'Área Serviço', Icon: Sparkles },
  { name: 'Bed', label: 'Quarto', Icon: Bed },
  { name: 'BedDouble', label: 'Quarto Casal', Icon: BedDouble },
  { name: 'Bath', label: 'Banheiro', Icon: Bath },
  { name: 'ShowerHead', label: 'Ducha', Icon: ShowerHead },
  { name: 'Car', label: 'Garagem', Icon: Car },
  { name: 'Trees', label: 'Jardim', Icon: Trees },
  { name: 'Sun', label: 'Varanda', Icon: Sun },
  { name: 'Flower2', label: 'Quintal', Icon: Flower2 },
  { name: 'DoorOpen', label: 'Entrada / Hall', Icon: DoorOpen },
  { name: 'Key', label: 'Acesso', Icon: Key },
  { name: 'Waves', label: 'Piscina', Icon: Waves },
  { name: 'Dumbbell', label: 'Academia', Icon: Dumbbell },
];

export const RoomManagerModal: React.FC<RoomManagerModalProps> = ({
  rooms,
  isOpen,
  onClose,
  onAddRoom,
  onDeleteRoom,
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sofa');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim(), selectedIcon);
    setNewRoomName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md oneui-glass rounded-[32px] p-6 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-light text-white">Gerenciar Cômodos</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing Rooms List */}
        <div className="mt-4 max-h-52 overflow-y-auto space-y-2 pr-1">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
            >
              <span className="font-medium text-sm text-white">{room.name}</span>
              {room.id !== 'favorites' ? (
                <button
                  onClick={() => onDeleteRoom(room.id)}
                  title="Excluir cômodo"
                  className="p-2 rounded-full text-rose-400 hover:text-rose-200 hover:bg-rose-500/20"
                >
                  <Trash2 size={15} />
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-medium px-2 py-0.5">Padrão</span>
              )}
            </div>
          ))}
        </div>

        {/* Add New Room Form */}
        <form onSubmit={handleCreate} className="mt-5 pt-4 border-t border-white/10 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Novo Cômodo
          </h3>

          <div>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nome (ex: Varanda, Garagem...)"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Ícone: <span className="text-white font-medium">{AVAILABLE_ICONS.find((i) => i.name === selectedIcon)?.label}</span>
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto no-scrollbar p-2 rounded-2xl bg-white/5 border border-white/10">
              {AVAILABLE_ICONS.map(({ name, label, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  title={label}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedIcon === name
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newRoomName.trim()}
            className="w-full py-3 rounded-2xl font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Criar Cômodo
          </button>
        </form>
      </div>
    </div>
  );
};
