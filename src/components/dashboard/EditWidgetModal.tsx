import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { WidgetConfig, WidgetSize, RoomConfig } from '../../types/dashboard';
import { GADGET_ICON_CATEGORIES } from '../oneui/DynamicIcon';

interface EditWidgetModalProps {
  widget: WidgetConfig;
  defaultName?: string;
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
  defaultName = '',
  rooms,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(widget.customName || defaultName || '');
  const [size, setSize] = useState<WidgetSize>(widget.size);
  const [color, setColor] = useState(widget.customColor || '#2C75FF');
  const [icon, setIcon] = useState(widget.customIcon || '');
  const [roomId, setRoomId] = useState(widget.roomId);
  const [selectedCategory, setSelectedCategory] = useState(0);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      customName: name.trim() || undefined,
      size,
      customColor: color,
      customIcon: icon || undefined,
      roomId,
    });
    onClose();
  };

  const renderIconPreview = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Sparkles;
    return <IconComponent size={20} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none">
      <div className="w-full max-w-lg oneui-glass rounded-[32px] p-6 shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Live Preview Avatar */}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all"
              style={{
                backgroundColor: `${color}25`,
                color: color,
              }}
            >
              {icon ? renderIconPreview(icon) : <Icons.Layers size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-light text-white">Personalizar Gadget</h2>
              <p className="text-xs text-slate-400">Altere nome, ícone, tamanho e cor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="mt-5 space-y-5 flex-1 overflow-y-auto pr-1">
          {/* Custom Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome de Exibição
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lustre da Sala, Cafeteira..."
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
          </div>

          {/* Icon Picker Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ícone do Gadget
              </label>
              {icon && (
                <button
                  type="button"
                  onClick={() => setIcon('')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Restaurar padrão
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
              {GADGET_ICON_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setSelectedCategory(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === idx
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-5 gap-2 p-2 rounded-2xl bg-white/5 border border-white/10 max-h-36 overflow-y-auto">
              {GADGET_ICON_CATEGORIES[selectedCategory].icons.map((item) => {
                const isSelected = icon === item.name;
                const IconComp = (Icons as any)[item.name] || Icons.Circle;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-blue-600/30 text-blue-400 scale-105 border border-blue-500/50'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.label}
                  >
                    <IconComp size={20} />
                    <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tamanho do Card
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {(['pill', '1x1', '2x1', '2x2'] as WidgetSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-2.5 px-1 rounded-2xl text-[11px] font-semibold border transition-all text-center ${
                    size === s
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {s === 'pill' ? 'Pílula' : s === '1x1' ? '1x1 Card' : s === '2x1' ? '2x1 Barra' : '2x2 Amplo'}
                </button>
              ))}
            </div>
          </div>

          {/* Room Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
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
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
