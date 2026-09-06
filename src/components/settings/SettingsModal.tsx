import React, { useState } from 'react';
import {
  X,
  Server,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  User,
  MapPin,
  LayoutGrid,
  Smartphone,
  BellRing,
} from 'lucide-react';
import { HAConnectionConfig } from '../../types/homeAssistant';
import { ThemeConfig, ThemePreset } from '../../types/dashboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  city?: string;
  onUpdateUser: (name: string, city?: string) => void;
  haConfig: HAConnectionConfig;
  onSaveHAConfig: (config: HAConnectionConfig) => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: Partial<ThemeConfig>) => void;
  screensaverMinutes: number;
  onUpdateScreensaver: (minutes: number) => void;
  onExportLayout: () => void;
  onImportLayout: (json: string) => boolean;
  onResetLayout: () => void;
}

const THEME_PRESETS: { id: ThemePreset; name: string; desc: string }[] = [
  { id: 'oneui-dark', name: 'One UI Dark Glass', desc: 'Vidro fosco escuro com desfoque profundo' },
  { id: 'amoled-black', name: 'AMOLED Black', desc: 'Preto puro para economia de bateria e contraste' },
  { id: 'cyber-night', name: 'Cyber Blue', desc: 'Gradiente azul noturno com reflexos ciano' },
  { id: 'sunset-glow', name: 'Sunset Glow', desc: 'Tons acolhedores âmbar e violeta' },
  { id: 'oneui-light', name: 'One UI Light', desc: 'Estilo claro translúcido' },
];

const ACCENT_COLORS = [
  { name: 'Samsung Blue', hex: '#2C75FF' },
  { name: 'Amber Gold', hex: '#FFB020' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Cyan Cool', hex: '#06B6D4' },
  { name: 'Violet Glow', hex: '#8B5CF6' },
  { name: 'Rose Red', hex: '#F43F5E' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userName,
  city,
  onUpdateUser,
  haConfig,
  onSaveHAConfig,
  theme,
  onUpdateTheme,
  screensaverMinutes,
  onUpdateScreensaver,
  onExportLayout,
  onImportLayout,
  onResetLayout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'ha' | 'theme' | 'widgets' | 'backup'>('profile');
  const [nameInput, setNameInput] = useState(userName);
  const [cityInput, setCityInput] = useState(city || '');
  const [host, setHost] = useState(haConfig.host);
  const [token, setToken] = useState(haConfig.token);
  const [demoMode, setDemoMode] = useState(haConfig.useDemoMode);
  const [customWallpaper, setCustomWallpaper] = useState(theme.customWallpaperUrl || '');
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(nameInput, cityInput);
    onClose();
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHAConfig({
      host: host.trim(),
      token: token.trim(),
      useDemoMode: demoMode,
    });
    onClose();
  };

  const handleImport = () => {
    const success = onImportLayout(importJsonText);
    setImportStatus(success ? 'success' : 'error');
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const hour = new Date().getHours();
  const greetingPreview =
    hour >= 5 && hour < 12
      ? `Bom dia, ${nameInput || 'Bruno'}!`
      : hour >= 12 && hour < 18
      ? `Boa tarde, ${nameInput || 'Bruno'}!`
      : `Boa noite, ${nameInput || 'Bruno'}!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg select-none">
      <div className="w-full max-w-xl oneui-glass rounded-[32px] p-6 md:p-8 shadow-2xl border border-white/20 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/koti_icon.jpg" alt="Koti" className="w-8 h-8 rounded-xl shadow-md border border-white/20" />
            <h2 className="text-xl font-light text-white">Ajustes do Koti</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={14} />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('ha')}
            className={`flex-1 min-w-[110px] py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ha'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server size={14} />
            <span>Home Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette size={14} />
            <span>Tema One UI</span>
          </button>

          <button
            onClick={() => setActiveTab('widgets')}
            className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'widgets'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={14} />
            <span>Widgets Android</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download size={14} />
            <span>Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-6 pr-1">
          {/* TAB 0: PROFILE & WEATHER LOCATION */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Greeting Live Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-900/60 border border-blue-500/30">
                <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">
                  Prévia da Saudação Dinâmica
                </span>
                <div className="text-2xl font-light text-white mt-1">{greetingPreview}</div>
                <p className="text-xs text-slate-400 mt-1">
                  Muda automaticamente ao longo do dia (Bom dia, Boa tarde, Boa noite).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ex: Bruno"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-cyan-400" />
                  Cidade / Região (Meteorologia)
                </label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Ex: São Paulo, Curitiba, Belo Horizonte (ou deixe em branco para GPS)"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Se deixar vazio, o Koti buscará a previsão com base na localização atual do seu aparelho.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 transition-all"
              >
                Salvar Perfil e Localização
              </button>
            </form>
          )}

          {/* TAB 1: HOME ASSISTANT CONNECTION */}
          {activeTab === 'ha' && (
            <form onSubmit={handleSaveConnection} className="space-y-4">
              {/* Demo Mode Toggle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-1.5">
                    <Sparkles size={16} className="text-amber-400" />
                    Modo Demonstração / Simulado
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Simula dispositivos Zigbee interativos sem precisar de conexão ativa no momento.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              {!demoMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      IP / Endereço do Raspberry Pi
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="Ex: 192.168.1.150:8123 ou homeassistant.local:8123"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Conexão direta local via WebSocket (rápido e sem intermediários).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Token de Acesso (Long-Lived Access Token)
                    </label>
                    <textarea
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      rows={3}
                      placeholder="Cole aqui o token gerado no seu perfil do Home Assistant..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 transition-all"
              >
                Salvar Configuração de Conexão
              </button>
            </form>
          )}

          {/* TAB 2: THEME & ONE UI STYLE */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Estilo de Tema One UI 9
                </label>
                <div className="space-y-2">
                  {THEME_PRESETS.map((p) => {
                    const isSelected = theme.preset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onUpdateTheme({ preset: p.id })}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-sm text-white">{p.name}</div>
                          <div className="text-xs text-slate-400">{p.desc}</div>
                        </div>
                        {isSelected && <Check size={18} className="text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Cor de Acento do Sistema
                </label>
                <div className="flex items-center gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => onUpdateTheme({ accentColor: c.hex })}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.hex,
                        outline: theme.accentColor === c.hex ? '2px solid white' : 'none',
                        outlineOffset: '2px',
                      }}
                      title={c.name}
                    >
                      {theme.accentColor === c.hex && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  URL de Papel de Parede Personalizado
                </label>
                <input
                  type="text"
                  value={customWallpaper}
                  onChange={(e) => {
                    setCustomWallpaper(e.target.value);
                    onUpdateTheme({ customWallpaperUrl: e.target.value });
                  }}
                  placeholder="https://exemplo.com/papel-de-parede.jpg"
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              {/* Screensaver timeout */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Protetor de Tela (Modo Ambiente Tablet)
                </label>
                <select
                  value={screensaverMinutes}
                  onChange={(e) => onUpdateScreensaver(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm"
                >
                  <option value={0}>Desativado</option>
                  <option value={1}>1 minuto de inatividade</option>
                  <option value={3}>3 minutos de inatividade</option>
                  <option value={5}>5 minutos de inatividade</option>
                  <option value={10}>10 minutos de inatividade</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: ANDROID WIDGETS & NOTIFICATION TILES */}
          {activeTab === 'widgets' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Smartphone size={16} className="text-blue-400" />
                  Controle Direto pelo Android
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  O Koti suporta widgets nativos da tela inicial do Android e botões na cortina de notificações da Samsung One UI, permitindo controlar seus aparelhos sem precisar abrir o app!
                </p>
              </div>

              {/* SECTION 1: HOME SCREEN WIDGETS */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <LayoutGrid size={14} className="text-cyan-400" />
                  Widgets da Tela Inicial (Launcher)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Single Button 1x1 Widget Card */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Botão Rápido (1x1)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                          Compacto
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Um interruptor discreto na sua tela inicial para ligar ou desligar um aparelho com um único toque.
                      </p>
                    </div>

                    {/* Visual mockup */}
                    <div className="mt-3 p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Luz Principal</div>
                        <div className="text-[10px] text-emerald-400">Toque para alternar</div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-button 4x2 Block Widget Card */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Painel de Botões (4x2)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                          Bloco Completo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Um mosaico com 4 atalhos rápidos personalizáveis em estilo vidro fosco Samsung One UI.
                      </p>
                    </div>

                    {/* Visual mockup */}
                    <div className="mt-3 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 grid grid-cols-2 gap-1.5 text-center">
                      <div className="p-1.5 rounded-xl bg-white/5 text-[10px] text-amber-300">💡 Luz Sala</div>
                      <div className="p-1.5 rounded-xl bg-white/5 text-[10px] text-blue-300">💡 Quarto</div>
                      <div className="p-1.5 rounded-xl bg-white/5 text-[10px] text-purple-300">🎬 Cinema</div>
                      <div className="p-1.5 rounded-xl bg-white/5 text-[10px] text-emerald-300">🔌 Setup</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-300">
                  <span className="font-semibold text-white">Como adicionar na tela inicial:</span>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-[11px] text-slate-400">
                    <li>Pressione e segure em qualquer espaço vazio da tela inicial do celular.</li>
                    <li>Toque em <strong>Widgets</strong> e procure por <strong>Koti</strong>.</li>
                    <li>Escolha entre <em>Botão Rápido (1x1)</em> ou <em>Painel de Botões</em> e arraste para a tela.</li>
                  </ol>
                </div>
              </div>

              {/* SECTION 2: NOTIFICATION QUICK SETTINGS TILES */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BellRing size={14} className="text-amber-400" />
                  Área de Controle / Notificações (Quick Settings)
                </h4>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Atalho Rápido na Cortina</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                      One UI Control
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Adiciona botões direto no menu que você puxa de cima para baixo no Android (ao lado do Wi-Fi, Lanterna e Bluetooth).
                  </p>

                  {/* Mockup */}
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Koti Luz Sala</div>
                        <div className="text-[10px] text-slate-400">Ativado • Acesso instantâneo</div>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-600/30 text-blue-300">
                      Disponível
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-white/5 text-[11px] text-slate-400 space-y-1">
                    <span className="font-semibold text-white">Como adicionar aos atalhos rápidos:</span>
                    <p>1. Deslize para baixo duas vezes a barra de notificações do seu celular Samsung/Android.</p>
                    <p>2. Toque no ícone de lápis ou nos 3 pontinhos no canto superior e selecione <strong>Editar botões</strong>.</p>
                    <p>3. Encontre o botão <strong>Koti Luz Sala</strong> na lista e arraste para os atalhos principais.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & SYNC */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-1">Exportar Layout</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Baixe a configuração do seu dashboard para transferir facilmente para seu Tablet, TV ou outro celular.
                </p>
                <button
                  onClick={onExportLayout}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                >
                  <Download size={15} />
                  Baixar Arquivo JSON de Layout
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-1">Importar Layout</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Cole o código JSON do layout exportado para carregar instantaneamente sua organização de cards.
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  rows={3}
                  placeholder="Cole o JSON aqui..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white mb-3"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleImport}
                    disabled={!importJsonText.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Upload size={15} />
                    Restaurar Layout
                  </button>
                  {importStatus === 'success' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check size={14} /> Importado com sucesso!
                    </span>
                  )}
                  {importStatus === 'error' && (
                    <span className="text-xs text-rose-400">JSON inválido</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-rose-300">Restaurar Padrão</h4>
                  <p className="text-xs text-rose-400/80">
                    Volta o dashboard para o layout de fábrica.
                  </p>
                </div>
                <button
                  onClick={onResetLayout}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Restaurar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Version info footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-500">
          <span>Koti Smart Home • One UI 9</span>
          <span className="font-mono">v1.0.2</span>
        </div>
      </div>
    </div>
  );
};
