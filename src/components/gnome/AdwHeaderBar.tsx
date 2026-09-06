import React from 'react';
import {
  Home,
  LayoutGrid,
  Zap,
  Settings,
  Plus,
  Edit3,
  RefreshCw,
  Minus,
  Square,
  X,
  Radio,
} from 'lucide-react';
import { ConnectionStatus } from '../../types/homeAssistant';

export type GnomeTab = 'devices' | 'rooms' | 'scenes' | 'settings';

interface AdwHeaderBarProps {
  currentTab: GnomeTab;
  onSelectTab: (tab: GnomeTab) => void;
  connectionStatus: ConnectionStatus;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onRefresh?: () => void;
  onOpenSettings: () => void;
}

export const AdwHeaderBar: React.FC<AdwHeaderBarProps> = ({
  currentTab,
  onSelectTab,
  connectionStatus,
  isEditMode,
  onToggleEditMode,
  onAddWidget,
  onRefresh,
  onOpenSettings,
}) => {
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <header className="window-drag-region h-13 min-h-[52px] bg-[#303030] border-b border-black/40 flex items-center justify-between px-3 select-none z-40 sticky top-0">
      {/* Left: App Title & HA Status */}
      <div className="window-no-drag flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Blue House Icon */}
          <div className="w-7 h-7 rounded-lg bg-[#3584e4] flex items-center justify-center text-white shadow-sm">
            <Home size={16} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white">Koti</span>
        </div>

        {/* Connection status badge */}
        <button
          onClick={onOpenSettings}
          title={
            isConnected
              ? 'Conectado ao Home Assistant'
              : isConnecting
              ? 'Conectando...'
              : 'Desconectado - Clique para configurar'
          }
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 hover:bg-black/30 border border-white/5 transition-colors text-xs text-white/80"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-[#2ec27e] shadow-[0_0_8px_rgba(46,194,126,0.6)]'
                : isConnecting
                ? 'bg-[#e5a50a] animate-pulse'
                : 'bg-[#e01b24]'
            }`}
          />
          <span className="hidden sm:inline text-[11px] font-medium text-white/70">
            {isConnected ? 'Conectado' : isConnecting ? 'Conectando...' : 'Offline'}
          </span>
        </button>
      </div>

      {/* Center: AdwViewSwitcher (Segmented pill) */}
      <div className="window-no-drag hidden sm:flex items-center bg-black/30 p-1 rounded-lg border border-white/10">
        <button
          onClick={() => onSelectTab('devices')}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentTab === 'devices'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutGrid size={14} />
          <span>Dispositivos</span>
        </button>

        <button
          onClick={() => onSelectTab('rooms')}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentTab === 'rooms'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Radio size={14} />
          <span>Cômodos</span>
        </button>

        <button
          onClick={() => onSelectTab('scenes')}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentTab === 'scenes'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap size={14} />
          <span>Cenários</span>
        </button>

        <button
          onClick={() => onOpenSettings()}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Settings size={14} />
          <span>Ajustes</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="window-no-drag flex items-center gap-1.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Atualizar dados"
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        )}

        {/* Edit mode toggle */}
        <button
          onClick={onToggleEditMode}
          title={isEditMode ? 'Concluir edição' : 'Organizar e editar widgets'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            isEditMode
              ? 'bg-[#3584e4] text-white shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Edit3 size={14} />
          <span className="hidden md:inline">{isEditMode ? 'Pronto' : 'Editar'}</span>
        </button>

        {/* Add Device Button */}
        <button
          onClick={onAddWidget}
          title="Adicionar Dispositivo"
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3584e4] hover:bg-[#438de6] active:bg-[#1c71d8] text-white text-xs font-medium shadow-sm transition-colors"
        >
          <Plus size={15} />
          <span className="hidden md:inline">Adicionar</span>
        </button>
      </div>
    </header>
  );
};
