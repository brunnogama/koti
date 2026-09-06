import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { WidgetConfig, WidgetSize, RoomConfig } from '../../types/dashboard';

interface EditWidgetModalProps {
  widget: WidgetConfig;
  rooms: RoomConfig[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<WidgetConfig>) => void;
}

const COLOR_PRESETS = [
  { name: 'One UI Blue', color: '#2C75FF' },
  { name: 'Amber Gold', color: '#FFB020' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Cyan Cool', color: '#06B6D4' },
  { name: 'Violet Glow', color: '#8B5CF6' },
  { name: 'Rose Red', color: '#F43F5E' },
];

export const EditWidgetModal: React.FC<EditWidgetModalProps> = ({
  widget,
  rooms,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(widget.customName || '');
  const [size, setSize] = useState<WidgetSize>(widget.size);
  const [color, setColor] = useState(widget.customColor || '#2C75FF');
  const [roomId, setRoomId] = useState(widget.roomId);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      customName: name.trim() || undefined,
      size,
      customColor: color,
      roomId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md oneui-glass rounded-[32px] p-6 shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h2 className="text-xl font-light text-white">Editar Widget</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="mt-5 space-y-5">
          {/* Custom Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Luz do Teto, Abajur..."
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tamanho do Card
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1x1', '2x1', '2x2'] as WidgetSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                    size === s
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {s === '1x1' ? '1x1 Quadrado' : s === '2x1' ? '2x1 Retangular' : '2x2 Expandido'}
                </button>
              ))}
            </div>
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Cômodo
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PRESETS.map((cp) => (
                <button
                  key={cp.color}
                  type="button"
                  onClick={() => setColor(cp.color)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: cp.color,
                    boxShadow: color === cp.color ? `0 0 15px ${cp.color}` : 'none',
                    outline: color === cp.color ? '2px solid white' : 'none',
                    outlineOffset: '2px',
                  }}
                  title={cp.name}
                >
                  {color === cp.color && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
