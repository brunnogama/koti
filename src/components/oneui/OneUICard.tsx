import React from 'react';
import { Maximize2, MoveHorizontal, Trash2, Edit2, Star } from 'lucide-react';
import { WidgetSize } from '../../types/dashboard';

interface OneUICardProps {
  size: WidgetSize;
  isActive?: boolean;
  activeGlowColor?: string;
  isEditMode?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onResize?: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const OneUICard: React.FC<OneUICardProps> = ({
  size,
  isActive = false,
  activeGlowColor = '#2C75FF',
  isEditMode = false,
  isFavorite = false,
  onToggleFavorite,
  onResize,
  onMovePrev,
  onMoveNext,
  onEdit,
  onDelete,
  children,
  className = '',
  onClick,
}) => {
  // Map size to responsive grid col spans
  const colSpanClass =
    size === '2x1'
      ? 'col-span-2'
      : size === '2x2'
      ? 'col-span-2 row-span-2'
      : 'col-span-1';

  const isPill = size === 'pill';

  return (
    <div
      onClick={!isEditMode ? onClick : undefined}
      className={`relative group transition-all duration-300 select-none overflow-hidden outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 tv-focusable ${colSpanClass} ${
        isPill ? 'rounded-[22px] p-3 min-h-[64px]' : 'rounded-[28px] p-5 min-h-[140px]'
      } ${
        isActive
          ? 'bg-slate-900/75 border-white/15'
          : 'bg-slate-950/45 border-white/10'
      } backdrop-blur-2xl border shadow-xl hover:border-white/25 hover:shadow-2xl active:scale-[0.98] ${className}`}
      tabIndex={0}
    >
      {/* Edit Mode Overlay Toolbar */}
      {isEditMode && (
        <div className={`absolute ${isPill ? 'top-1.5 right-1.5' : 'top-2.5 right-2.5'} z-30 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-md px-1.5 py-1 rounded-full border border-white/20 shadow-lg`}>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-white'
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
              title="Redimensionar Widget (1x1 -> 2x1 -> 2x2)"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Maximize2 size={13} />
            </button>
          )}

          {onMovePrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMovePrev();
              }}
              title="Mover para a esquerda/cima"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoveHorizontal size={13} className="rotate-180" />
            </button>
          )}

          {onMoveNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveNext();
              }}
              title="Mover para a direita/baixo"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoveHorizontal size={13} />
            </button>
          )}

          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Editar Card"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
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
              className="p-1.5 rounded-full text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className={`h-full w-full ${isPill ? 'flex items-center' : 'flex flex-col justify-between'}`}>{children}</div>
    </div>
  );
};
