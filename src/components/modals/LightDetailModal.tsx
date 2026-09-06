import React, { useState, useEffect, useRef } from 'react';
import { X, Power, Palette, Check, Sun, Sparkles } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';

interface LightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig;
  entity?: HAEntityState;
  onToggle: () => void;
  onBrightnessChange: (val: number) => void;
  onColorChange: (rgb: [number, number, number]) => void;
}

// Convert [r, g, b] to hex #RRGGBB
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

// Convert hex #RRGGBB to [r, g, b]
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  const bigint = parseInt(clean, 16);
  if (isNaN(bigint)) return [255, 176, 32];
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

// Classic Apple Home color presets
const APPLE_HOME_PRESETS = [
  { name: 'Branco Quente (2700K)', hex: '#FFA845', rgb: [255, 168, 69] as [number, number, number] },
  { name: 'Branco Suave (3200K)', hex: '#FFC87A', rgb: [255, 200, 122] as [number, number, number] },
  { name: 'Luz do Dia (5000K)', hex: '#FFFFFF', rgb: [255, 255, 255] as [number, number, number] },
  { name: 'Âmbar Noturno', hex: '#FF9500', rgb: [255, 149, 0] as [number, number, number] },
  { name: 'Azul Céu', hex: '#00C7BE', rgb: [0, 199, 190] as [number, number, number] },
  { name: 'Violeta / Pôr do Sol', hex: '#AF52DE', rgb: [175, 82, 222] as [number, number, number] },
];

export const LightDetailModal: React.FC<LightDetailModalProps> = ({
  isOpen,
  onClose,
  config,
  entity,
  onToggle,
  onBrightnessChange,
  onColorChange,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Luz';

  const rawBrightness = entity?.attributes?.brightness ?? (isOn ? 255 : 0);
  const serverBrightness = Math.round((rawBrightness / 255) * 100);

  const [localBrightness, setLocalBrightness] = useState(serverBrightness);
  const [isDragging, setIsDragging] = useState(false);
  const lastVibratePct = useRef(serverBrightness);

  // Read current color from entity
  const entityRgb = entity?.attributes?.rgb_color as [number, number, number] | undefined;
  const currentHex = entityRgb
    ? rgbToHex(entityRgb[0], entityRgb[1], entityRgb[2])
    : (config.customColor || '#FFB020');

  const [selectedHex, setSelectedHex] = useState(currentHex);
  const [customColorInput, setCustomColorInput] = useState(currentHex);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalBrightness(serverBrightness);
    }
  }, [serverBrightness, isDragging]);

  useEffect(() => {
    if (entityRgb) {
      const h = rgbToHex(entityRgb[0], entityRgb[1], entityRgb[2]);
      setSelectedHex(h);
      setCustomColorInput(h);
    }
  }, [entityRgb]);

  if (!isOpen) return null;

  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(style === 'medium' ? 25 : 12);
      }
    } catch (_) {}
  };

  // Vertical Slider Handlers (Apple Home Capsule Slider)
  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const track = e.currentTarget;
    try {
      track.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(true);
    updateBrightnessFromY(e.clientY, track);
    triggerHaptic('light');
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    updateBrightnessFromY(e.clientY, e.currentTarget);
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
    triggerHaptic('medium');
  };

  const updateBrightnessFromY = (clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    // Vertical: bottom = 0%, top = 100%
    const rawPct = Math.round(((rect.bottom - clientY) / rect.height) * 100);
    const clamped = Math.max(1, Math.min(100, rawPct));
    setLocalBrightness(clamped);

    if (Math.abs(clamped - lastVibratePct.current) >= 15) {
      triggerHaptic('light');
      lastVibratePct.current = clamped;
    }

    if (!isOn && clamped > 0) {
      onToggle();
    }

    onBrightnessChange(Math.round((clamped / 100) * 255));
  };

  const handleSelectPreset = (rgb: [number, number, number], hex: string) => {
    setSelectedHex(hex);
    setCustomColorInput(hex);
    if (!isOn) onToggle();
    onColorChange(rgb);
    triggerHaptic('medium');
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColorInput(hex);
    setSelectedHex(hex);
    const rgb = hexToRgb(hex);
    if (!isOn) onToggle();
    onColorChange(rgb);
  };

  const displayBrightness = isDragging ? localBrightness : (isOn ? localBrightness : 0);
  const activeColor = isOn ? selectedHex : '#475569';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-[36px] bg-[#12151c]/95 border border-white/15 p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center select-none"
        style={{
          boxShadow: isOn ? `0 0 50px ${selectedHex}25, 0 25px 50px -12px rgba(0, 0, 0, 0.7)` : undefined,
        }}
      >
        {/* Top bar with close button */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-medium text-white truncate tracking-tight">{name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOn ? `Ligado • ${displayBrightness}%` : 'Desligado'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Power Toggle */}
            <button
              type="button"
              onClick={() => {
                onToggle();
                triggerHaptic('medium');
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOn ? 'shadow-lg text-white' : 'bg-white/10 text-slate-400'
              }`}
              style={
                isOn
                  ? {
                      backgroundColor: selectedHex,
                      boxShadow: `0 0 16px ${selectedHex}88`,
                    }
                  : undefined
              }
              title={isOn ? 'Desligar' : 'Ligar'}
            >
              <Power size={18} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Center: Apple Home Vertical Capsule Dimmer Slider */}
        <div className="my-3 flex flex-col items-center">
          <div
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
            className="relative w-28 h-64 rounded-[44px] bg-slate-800/60 border border-white/15 overflow-hidden shadow-inner cursor-ns-resize touch-none"
            title="Arraste verticalmente para ajustar o brilho"
          >
            {/* Filled brightness bottom part */}
            <div
              className="absolute left-0 right-0 bottom-0 rounded-[44px] transition-[height] duration-75"
              style={{
                height: `${displayBrightness}%`,
                backgroundColor: activeColor,
                boxShadow: isOn ? `0 0 25px ${selectedHex}66` : 'none',
              }}
            />

            {/* Sun Icon top */}
            <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
              <Sun
                size={22}
                className={displayBrightness > 80 ? 'text-slate-900/80' : 'text-white/80'}
              />
            </div>

            {/* Big percentage text inside slider */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className={`text-2xl font-semibold tracking-tight transition-colors ${
                  displayBrightness > 45 ? 'text-slate-900' : 'text-white'
                }`}
              >
                {displayBrightness}%
              </span>
            </div>
          </div>
        </div>

        {/* Apple Home Color Presets Section */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Cores da Luz
            </span>

            {/* Hidden native color input triggered by custom picker button */}
            <input
              ref={colorInputRef}
              type="color"
              value={customColorInput}
              onChange={handleCustomColorChange}
              className="sr-only"
            />
          </div>

          {/* Preset circles row (Apple Home style) */}
          <div className="grid grid-cols-6 gap-2 items-center justify-between">
            {APPLE_HOME_PRESETS.map((preset) => {
              const isSelected = selectedHex.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.rgb, preset.hex)}
                  title={preset.name}
                  className={`relative aspect-square rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-md ${
                    isSelected ? 'ring-2 ring-white scale-105 shadow-lg' : 'hover:ring-1 hover:ring-white/40'
                  }`}
                  style={{
                    backgroundColor: preset.hex,
                    boxShadow: isSelected ? `0 0 16px ${preset.hex}88` : undefined,
                  }}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className={preset.hex === '#FFFFFF' ? 'text-slate-900' : 'text-white'}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Color Wheel / Palette Button */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border border-white/30 shadow-inner"
                style={{ backgroundColor: selectedHex }}
              />
              <span className="text-xs text-slate-300 font-mono uppercase">{selectedHex}</span>
            </div>

            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all active:scale-95 border border-white/10"
            >
              <Palette size={14} />
              <span>Personalizar Cor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
