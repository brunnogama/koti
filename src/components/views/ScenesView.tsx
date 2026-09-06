import React, { useState } from 'react';
import { Sparkles, Play, Check, Star, Plus } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { MOCK_ENTITY_IDS } from '../../services/mockData';

interface ScenesViewProps {
  entities: Record<string, HAEntityState>;
  widgets: WidgetConfig[];
  isEditMode: boolean;
  accentColor?: string;
  onTriggerScene: (entityId: string) => void;
  onAddSceneWidget: (sceneEntityId: string, friendlyName: string) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export const ScenesView: React.FC<ScenesViewProps> = ({
  entities,
  widgets,
  isEditMode,
  accentColor = '#8B5CF6',
  onTriggerScene,
  onAddSceneWidget,
  onRemoveWidget,
}) => {
  const [activeTriggerId, setActiveTriggerId] = useState<string | null>(null);

  // Filter ONLY real Home Assistant scenes (no mock entities)
  const realScenes = Object.values(entities).filter(
    (e) => e.entity_id.startsWith('scene.') && !MOCK_ENTITY_IDS.has(e.entity_id)
  );

  const handleTrigger = (entityId: string) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    } catch (_) {}

    onTriggerScene(entityId);
    setActiveTriggerId(entityId);
    setTimeout(() => setActiveTriggerId(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header Info Banner in Edit Mode */}
      {isEditMode && (
        <div className="p-4 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-purple-300 text-xs">
            <Sparkles size={16} />
            <span>Modo de Edição de Cenários: fixe cenários diretamente na tela inicial do seu Koti.</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {realScenes.length === 0 && (
        <div className="py-20 text-center oneui-glass rounded-[32px] p-8 border border-white/10">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-lg"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor,
            }}
          >
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-light text-white">Nenhum cenário cadastrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Os cenários cadastrados no seu Home Assistant aparecem aqui automaticamente. Crie automações ou cenas no Home Assistant para ativá-las com 1 toque.
          </p>
        </div>
      )}

      {/* Scenes Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {realScenes.map((scene) => {
          const isTriggered = activeTriggerId === scene.entity_id;
          const friendlyName = scene.attributes.friendly_name || scene.entity_id;
          const existingWidget = widgets.find((w) => w.entityId === scene.entity_id);
          const isPinned = !!existingWidget;

          return (
            <div
              key={scene.entity_id}
              onClick={() => {
                if (!isEditMode) {
                  handleTrigger(scene.entity_id);
                }
              }}
              className={`p-5 rounded-[28px] oneui-glass border shadow-lg flex items-center justify-between transition-all duration-300 relative overflow-hidden ${
                isTriggered
                  ? 'border-purple-500 bg-purple-950/40 shadow-[0_0_25px_rgba(139,92,246,0.4)]'
                  : 'border-white/10 hover:border-white/20 hover:scale-[1.01] active:scale-[0.98]'
              } ${!isEditMode ? 'cursor-pointer' : ''}`}
            >
              {/* Ripple Glow Animation Background */}
              {isTriggered && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 pointer-events-none animate-pulse" />
              )}

              <div className="flex items-center gap-4 min-w-0 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-md ${
                    isTriggered ? 'bg-purple-600 text-white scale-110' : ''
                  }`}
                  style={
                    !isTriggered
                      ? {
                          backgroundColor: `${accentColor}25`,
                          color: accentColor,
                        }
                      : undefined
                  }
                >
                  {isTriggered ? <Check size={22} /> : <Sparkles size={22} />}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-light text-white truncate">{friendlyName}</h3>
                  <span className="block text-xs text-slate-400 font-mono mt-0.5 truncate">
                    {scene.entity_id}
                  </span>
                </div>
              </div>

              <div className="relative z-10 shrink-0" onClick={(e) => e.stopPropagation()}>
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isPinned && existingWidget) {
                        onRemoveWidget(existingWidget.id);
                      } else {
                        onAddSceneWidget(scene.entity_id, friendlyName);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isPinned
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    {isPinned ? (
                      <>
                        <Check size={13} />
                        <span>Fixado</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Fixar no Início</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleTrigger(scene.entity_id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isTriggered
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white'
                    }`}
                    title="Ativar Cenário"
                  >
                    {isTriggered ? <Check size={18} /> : <Play size={18} fill="currentColor" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
