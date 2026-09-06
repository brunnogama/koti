import React, { useState } from 'react';
import { Zap, Check, Plus, Trash2, Sparkles } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { MOCK_ENTITY_IDS } from '../../services/mockData';

interface GnomeScenesViewProps {
  entities: Record<string, HAEntityState>;
  widgets: WidgetConfig[];
  isEditMode: boolean;
  onTriggerScene: (entityId: string) => void;
  onAddSceneWidget: (sceneEntityId: string, friendlyName: string) => void;
  onRemoveWidget: (widgetId: string) => void;
}

export const GnomeScenesView: React.FC<GnomeScenesViewProps> = ({
  entities,
  widgets,
  isEditMode,
  onTriggerScene,
  onAddSceneWidget,
  onRemoveWidget,
}) => {
  const [activeTriggerId, setActiveTriggerId] = useState<string | null>(null);

  // Filter ONLY real Home Assistant scenes
  const realScenes = Object.values(entities).filter(
    (e) => e.entity_id.startsWith('scene.') && !MOCK_ENTITY_IDS.has(e.entity_id)
  );

  const handleTrigger = (entityId: string) => {
    onTriggerScene(entityId);
    setActiveTriggerId(entityId);
    setTimeout(() => setActiveTriggerId(null), 1800);
  };

  return (
    <div className="max-w-3xl mx-auto w-full py-6 px-4 space-y-6 animate-in fade-in duration-200">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Cenários & Automações</h2>
        <p className="text-xs text-white/60 mt-0.5">
          Execute rotinas e cenários configurados no seu Home Assistant
        </p>
      </div>

      {realScenes.length === 0 ? (
        <div className="adw-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/40 mx-auto">
            <Zap size={24} />
          </div>
          <div className="text-sm font-medium text-white">Nenhum cenário encontrado</div>
          <div className="text-xs text-white/50 max-w-sm mx-auto">
            Nenhum cenário (`scene.*`) foi detectado na sua instância do Home Assistant. Crie
            cenários no Home Assistant para vê-los aqui.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase px-1">
            Cenários Disponíveis ({realScenes.length})
          </span>

          <div className="adw-card overflow-hidden divide-y divide-white/[0.06]">
            {realScenes.map((scene) => {
              const isTriggered = activeTriggerId === scene.entity_id;
              const existingWidget = widgets.find((w) => w.entityId === scene.entity_id);
              const name = scene.attributes?.friendly_name || scene.entity_id.replace('scene.', '');

              return (
                <div
                  key={scene.entity_id}
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isTriggered
                          ? 'bg-[#2ec27e]/20 text-[#2ec27e]'
                          : 'bg-[#3584e4]/20 text-[#3584e4]'
                      }`}
                    >
                      {isTriggered ? <Check size={18} /> : <Zap size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{name}</div>
                      <div className="text-xs text-white/50 font-mono truncate">
                        {scene.entity_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditMode ? (
                      existingWidget ? (
                        <button
                          onClick={() => onRemoveWidget(existingWidget.id)}
                          title="Remover do painel inicial"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={13} />
                          <span>Remover</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddSceneWidget(scene.entity_id, name)}
                          title="Fixar no painel inicial"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3584e4]/20 hover:bg-[#3584e4]/30 text-[#3584e4] text-xs font-medium transition-colors"
                        >
                          <Plus size={13} />
                          <span>Fixar</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleTrigger(scene.entity_id)}
                        disabled={isTriggered}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isTriggered
                            ? 'bg-[#2ec27e] text-white shadow-sm'
                            : 'adw-btn adw-btn-suggested'
                        }`}
                      >
                        {isTriggered ? (
                          <>
                            <Check size={14} />
                            <span>Executado!</span>
                          </>
                        ) : (
                          <>
                            <Zap size={14} />
                            <span>Executar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
