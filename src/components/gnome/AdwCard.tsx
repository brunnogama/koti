import React from 'react';
import { Maximize2, Trash2, Edit2, Star } from 'lucide-react';
import { WidgetSize } from '../../types/dashboard';

interface AdwCardProps {
  size: WidgetSize;
  isActive?: boolean;
  isEditMode?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onResize?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AdwCard: React.FC<AdwCardProps> = ({
  size,
  isActive = false,
  isEditMode = false,
  isFavorite = false,
  onToggleFavorite,
  onResize,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  children,
  className = '',
  onClick,
}) => {
  // Grid column spans
  const colSpanClass =
    size === '2x1'
      ? 'col-span-1 sm:col-span-2'
      : size === '2x2'
      ? 'col-span-1 sm:col-span-2 row-span-2'
      : 'col-span-1';

  const isPill = size === 'pill';

  return (
    <div
      onClick={!isEditMode ? onClick : onEdit}
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative group select-none overflow-hidden transition-all duration-150 rounded-xl border ${colSpanClass} ${
        isPill ? 'p-3.5 min-h-[64px]' : 'p-4 min-h-[136px]'
      } ${
        isActive
          ? 'bg-white/[0.11] border-[#3584e4]/40 shadow-sm'
          : 'bg-white/[0.06] hover:bg-white/[0.09] border-white/[0.08] hover:border-white/[0.14]'
      } ${
        isEditMode ? 'cursor-grab active:cursor-grabbing border-dashed border-[#3584e4]/60' : ''
      } ${className}`}
    >
      {/* GNOME Edit Toolbar */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-[#242424]/95 px-1.5 py-1 rounded-lg border border-white/10 shadow-lg backdrop-blur-md">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-white/60 hover:text-white'
              }`}
            >
              <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}

          {onResize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResize();
              }}
              title="Redimensionar Widget"
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Renomear e Personalizar"
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Edit2 size={13} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Remover Widget"
              className="p-1.5 rounded-md text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={`h-full w-full ${isPill ? 'flex items-center' : 'flex flex-col justify-between'}`}>
        {children}
      </div>
    </div>
  );
};
