import React, { useState } from 'react';
import {
  X,
  Server,
  Palette,
  Info,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { ConnectionStatus, HAConfig } from '../../types/homeAssistant';
import { PlatformMode, PlatformType } from '../../hooks/usePlatform';

interface GnomeSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  haConfig: HAConfig;
  connectionStatus: ConnectionStatus;
  onSaveHAConfig: (config: HAConfig) => void;
  platformMode: PlatformMode;
  activePlatform: PlatformType;
  onSelectPlatformMode: (mode: PlatformMode) => void;
  city?: string;
  onUpdateCity: (city: string) => void;
}

export const GnomeSettingsDialog: React.FC<GnomeSettingsDialogProps> = ({
  isOpen,
  onClose,
  haConfig,
  connectionStatus,
  onSaveHAConfig,
  platformMode,
  activePlatform,
  onSelectPlatformMode,
  city,
  onUpdateCity,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'appearance' | 'about'>('connection');

  // Form local state
  const [haUrl, setHaUrl] = useState(haConfig.host || 'http://10.0.0.32:8123');
  const [haToken, setHaToken] = useState(haConfig.token || '');
  const [localCity, setLocalCity] = useState(city || 'São Paulo');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveHAConfig({ host: haUrl.trim(), token: haToken.trim(), useDemoMode: false });
    onUpdateCity(localCity.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#242424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Adwaita Dialog HeaderBar */}
        <div className="h-13 min-h-[52px] bg-[#303030] border-b border-black/40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab('connection')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'connection'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Server size={13} />
              <span>Conexão</span>
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'appearance'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Palette size={13} />
              <span>Aparência</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'about'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Info size={13} />
              <span>Sobre</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CONEXÃO HOME ASSISTANT */}
          {activeTab === 'connection' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className="adw-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected
                        ? 'bg-[#2ec27e] shadow-[0_0_8px_rgba(46,194,126,0.6)]'
                        : isConnecting
                        ? 'bg-[#e5a50a] animate-pulse'
                        : 'bg-[#e01b24]'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {isConnected
                        ? 'Conectado ao Home Assistant'
                        : isConnecting
                        ? 'Conectando ao servidor...'
                        : 'Servidor Desconectado'}
                    </div>
                    <div className="text-xs text-white/50">{haUrl}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="adw-btn adw-btn-flat text-xs flex items-center gap-1.5 text-white/80 hover:text-white"
                >
                  <RefreshCw size={13} className={isConnecting ? 'animate-spin' : ''} />
                  <span>Reconectar</span>
                </button>
              </div>

              {/* Preferences Group */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-1">
                  Configurações do Servidor
                </span>

                <div className="adw-card p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      URL do Home Assistant
                    </label>
                    <input
                      type="text"
                      value={haUrl}
                      onChange={(e) => setHaUrl(e.target.value)}
                      placeholder="http://10.0.0.32:8123"
                      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-white font-mono focus:border-[#3584e4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Token de Acesso de Longa Duração
                    </label>
                    <textarea
                      rows={3}
                      value={haToken}
                      onChange={(e) => setHaToken(e.target.value)}
                      placeholder="Cole aqui seu token de acesso gerado no perfil do Home Assistant..."
                      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-xs text-white font-mono focus:border-[#3584e4] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave()}
                      className="adw-btn adw-btn-suggested flex items-center gap-1.5 text-xs"
                    >
                      {isSaved ? (
                        <>
                          <Check size={14} />
                          <span>Salvo e Conectado!</span>
                        </>
                      ) : (
                        <span>Salvar & Conectar</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APARÊNCIA E PLATAFORMA */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Preferences Group: Interface Style */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-1">
                  Estilo da Interface por Plataforma
                </span>

                <div className="adw-card overflow-hidden divide-y divide-white/[0.06]">
                  {/* Option: Auto */}
                  <div
                    onClick={() => onSelectPlatformMode('auto')}
                    className="p-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          Automático (Recomendado)
                        </div>
                        <div className="text-xs text-white/50">
                          Detecta o sistema operacional (GNOME no Fedora / Linux, One UI no Android)
                        </div>
                      </div>
                    </div>
                    {platformMode === 'auto' && (
                      <div className="w-5 h-5 rounded-full bg-[#3584e4] flex items-center justify-center text-white">
                        <Check size={13} />
                      </div>
                    )}
                  </div>

                  {/* Option: GNOME 50 */}
                  <div
                    onClick={() => onSelectPlatformMode('gnome')}
                    className="p-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3584e4]/20 flex items-center justify-center text-[#3584e4]">
                        <Monitor size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">GNOME 50 (Libadwaita)</div>
                        <div className="text-xs text-white/50">
                          HeaderBar, ActionRows, GtkSwitch e paleta Adwaita Dark
                        </div>
                      </div>
                    </div>
                    {platformMode === 'gnome' && (
                      <div className="w-5 h-5 rounded-full bg-[#3584e4] flex items-center justify-center text-white">
                        <Check size={13} />
                      </div>
                    )}
                  </div>

                  {/* Option: Samsung One UI */}
                  <div
                    onClick={() => onSelectPlatformMode('oneui')}
                    className="p-3.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Smartphone size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Samsung One UI 9</div>
                        <div className="text-xs text-white/50">
                          Pílulas compactas, cantos de 28px e navegação inferior móvel
                        </div>
                      </div>
                    </div>
                    {platformMode === 'oneui' && (
                      <div className="w-5 h-5 rounded-full bg-[#3584e4] flex items-center justify-center text-white">
                        <Check size={13} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences Group: Cidade */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-1">
                  Clima & Previsão
                </span>

                <div className="adw-card p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Cidade / Localização
                    </label>
                    <input
                      type="text"
                      value={localCity}
                      onChange={(e) => setLocalCity(e.target.value)}
                      placeholder="Ex: São Paulo, Curitiba, Brasília..."
                      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-white focus:border-[#3584e4] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave()}
                      className="adw-btn adw-btn-suggested text-xs"
                    >
                      Atualizar Cidade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOBRE O KOTI */}
          {activeTab === 'about' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-2xl bg-[#3584e4] flex items-center justify-center text-white mx-auto shadow-lg">
                <ShieldCheck size={44} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Koti Smart Home</h3>
                <p className="text-xs text-white/60 mt-0.5">Versão 1.0.4 • Fedora Linux (RPM)</p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 font-medium">
                  GNOME 50 / Libadwaita Edition
                </div>
              </div>

              <div className="adw-card p-4 text-xs text-white/70 space-y-2 text-left">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Desenvolvedor</span>
                  <span className="font-medium text-white">Bruno Gama</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Plataforma Ativa</span>
                  <span className="font-medium text-[#3584e4] uppercase font-mono">
                    {activePlatform}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/50">Integração</span>
                  <span className="font-medium text-white">Home Assistant Core WebSocket</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/50">Pacote do Sistema</span>
                  <span className="font-medium text-white">Fedora .rpm (x86_64)</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://github.com/brunnogama/koti"
                  target="_blank"
                  rel="noreferrer"
                  className="adw-btn adw-btn-flat text-xs inline-flex items-center gap-1.5 text-white/80 hover:text-white"
                >
                  <span>Código-fonte no GitHub</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
