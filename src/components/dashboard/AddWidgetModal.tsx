import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig, WidgetSize } from '../../types/dashboard';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (widget: Omit<WidgetConfig, 'id' | 'order'>) => void;
  availableEntities: Record<string, HAEntityState>;
  currentRoomId: string;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  availableEntities,
  currentRoomId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [size, setSize] = useState<WidgetSize>('1x1');

  if (!isOpen) return null;

  const entityList = Object.values(availableEntities).filter((ent) => {
    const name = (ent.attributes.friendly_name || ent.entity_id).toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || ent.entity_id.includes(searchTerm.toLowerCase());
  });

  const handleAdd = () => {
    if (!selectedEntityId) return;
    const ent = availableEntities[selectedEntityId];
    onAdd({
      entityId: selectedEntityId,
      roomId: currentRoomId === 'favorites' ? 'living_room' : currentRoomId,
      size,
      customName: ent?.attributes.friendly_name,
      isFavorite: currentRoomId === 'favorites',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg oneui-glass rounded-[32px] p-6 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-light text-white">Adicionar Dispositivo</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar dispositivo ou sensor..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        {/* Entity List */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {entityList.map((ent) => {
            const isSelected = ent.entity_id === selectedEntityId;
            return (
              <button
                key={ent.entity_id}
                type="button"
                onClick={() => setSelectedEntityId(ent.entity_id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-600/30 border border-blue-500 text-white'
                    : 'bg-white/5 border border-transparent text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-medium text-sm text-white">
                    {ent.attributes.friendly_name || ent.entity_id}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{ent.entity_id}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                  {ent.state}
                </span>
              </button>
            );
          })}
        </div>

        {/* Size Selection */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Tamanho Inicial
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['1x1', '2x1', '2x2'] as WidgetSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                  size === s
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-slate-300 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedEntityId}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <Plus size={15} />
            Adicionar Card
          </button>
        </div>
      </div>
    </div>
  );
};
