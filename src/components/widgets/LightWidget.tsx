import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lightbulb, Palette } from 'lucide-react';
import { HAEntityState } from '../../types/homeAssistant';
import { WidgetConfig } from '../../types/dashboard';
import { OneUICard } from '../oneui/OneUICard';
import { OneUISlider } from '../oneui/OneUISlider';
import { DynamicIcon } from '../oneui/DynamicIcon';
import { LightDetailModal, rgbToHex } from '../modals/LightDetailModal';

interface LightWidgetProps {
  config: WidgetConfig;
  entity?: HAEntityState;
  isEditMode: boolean;
  onToggle: () => void;
  onBrightnessChange: (val: number) => void;
  onColorChange?: (rgb: [number, number, number]) => void;
  onResize?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const LightWidget: React.FC<LightWidgetProps> = ({
  config,
  entity,
  isEditMode,
  onToggle,
  onBrightnessChange,
  onColorChange,
  onResize,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isOn = entity?.state === 'on';
  const name = config.customName || entity?.attributes?.friendly_name || 'Luz';
  const rawBrightness = entity?.attributes?.brightness ?? (isOn ? 255 : 0);
  const serverBrightness = Math.round((rawBrightness / 255) * 100);

  // Dynamic light color matching the exact current color of the light
  const rgbColor = entity?.attributes?.rgb_color as [number, number, number] | undefined;
  const activeColor = useMemo(() => {
    if (rgbColor && Array.isArray(rgbColor) && rgbColor.length === 3) {
      return rgbToHex(rgbColor[0], rgbColor[1], rgbColor[2]);
    }
    return config.customColor || '#FFB020';
  }, [rgbColor, config.customColor]);

  const [localBrightness, setLocalBrightness] = useState(serverBrightness);
  const [isDragging, setIsDragging] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const lastVibratePct = useRef(serverBrightness);
  const currentBrightnessRef = useRef(serverBrightness);
  const releaseCooldownTimerRef = useRef<any>(null);
  const throttleTimerRef = useRef<any>(null);

  useEffect(() => {
    // Only update local state from server if user is NOT dragging AND not in cooldown after release
    if (!isDragging && !releaseCooldownTimerRef.current) {
      setLocalBrightness(serverBrightness);
      currentBrightnessRef.current = serverBrightness;
    }
  }, [serverBrightness, isDragging]);

  useEffect(() => {
    return () => {
      if (releaseCooldownTimerRef.current) clearTimeout(releaseCooldownTimerRef.current);
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
    };
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(style === 'medium' ? 22 : 12);
      }
    } catch (_) {}
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    e.stopPropagation();
    const track = e.currentTarget;
    try {
      track.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(true);
    updateBrightnessFromPointer(e.clientX, track);
    triggerHaptic('light');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isEditMode) return;
    e.stopPropagation();
    updateBrightnessFromPointer(e.clientX, e.currentTarget);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(false);
    triggerHaptic('medium');

    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }

    // Send final brightness directly in percent (0 to 100)
    const finalVal = currentBrightnessRef.current;
    onBrightnessChange(finalVal);

    // Keep cooldown for 1200ms so stale intermediate WebSocket updates don't snap the slider
    if (releaseCooldownTimerRef.current) clearTimeout(releaseCooldownTimerRef.current);
    releaseCooldownTimerRef.current = setTimeout(() => {
      releaseCooldownTimerRef.current = null;
    }, 1200);
  };

  const updateBrightnessFromPointer = (clientX: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const rawPct = Math.round(((clientX - rect.left) / rect.width) * 100);
    const clamped = Math.max(1, Math.min(100, rawPct));
    setLocalBrightness(clamped);
    currentBrightnessRef.current = clamped;

    // Subtle haptic every 15% change during drag
    if (Math.abs(clamped - lastVibratePct.current) >= 15) {
      triggerHaptic('light');
      lastVibratePct.current = clamped;
    }

    if (!isOn && clamped > 0) {
      onToggle();
    }

    // Throttled update while dragging to avoid flooding Home Assistant
    if (!throttleTimerRef.current) {
      onBrightnessChange(clamped);
      throttleTimerRef.current = setTimeout(() => {
        throttleTimerRef.current = null;
        if (currentBrightnessRef.current !== clamped) {
          onBrightnessChange(currentBrightnessRef.current);
        }
      }, 150);
    }
  };

  const isPill = config.size === 'pill';
  const displayBrightness = isDragging ? localBrightness : (isOn ? localBrightness : 0);

  // PILL FORMAT: Ultra-compact One UI horizontal slider
  if (isPill) {
    return (
      <>
        <OneUICard
          size={config.size}
          isActive={isOn}
          activeGlowColor={activeColor}
          isEditMode={isEditMode}
          isFavorite={config.isFavorite}
          onToggleFavorite={onToggleFavorite}
          onResize={onResize}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => setIsDetailModalOpen(true)}
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-full flex items-center justify-between overflow-hidden cursor-ew-resize touch-none"
          >
            {/* Active Dimmer fill background inside pill */}
            {isOn && (
              <div
                className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-[18px] transition-[width] duration-75"
                style={{
                  width: `${displayBrightness}%`,
                  backgroundColor: `${activeColor}35`,
                  borderRight: `2px solid ${activeColor}`,
                }}
              />
            )}

            {/* Left: Quick Toggle Icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
                triggerHaptic('medium');
              }}
              title={isOn ? 'Desligar' : 'Ligar'}
              className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isOn ? 'shadow-md' : 'bg-white/5 text-slate-400'
              }`}
              style={
                isOn
                  ? {
                      backgroundColor: `${activeColor}44`,
                      color: activeColor,
                    }
                  : undefined
              }
            >
              <DynamicIcon
                name={config.customIcon}
                defaultIcon={Lightbulb}
                size={18}
                className={isOn ? 'filter drop-shadow-[0_0_6px_currentColor]' : ''}
              />
            </button>

            {/* Center: Name */}
            <div className="relative z-10 flex-1 min-w-0 px-2.5">
              <span className="block text-xs font-medium text-white truncate">{name}</span>
              <span className="block text-[10px] text-slate-400 truncate">
                {isOn ? 'Arraste para dimerizar' : 'Desligada'}
              </span>
            </div>

            {/* Right: Percent badge */}
            <span
              className={`relative z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isOn ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
              }`}
            >
              {isOn ? `${displayBrightness}%` : '0%'}
            </span>
          </div>
        </OneUICard>

        <LightDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          config={config}
          entity={entity}
          onToggle={onToggle}
          onBrightnessChange={onBrightnessChange}
          onColorChange={(rgb) => onColorChange?.(rgb)}
        />
      </>
    );
  }

  // STANDARD CARD FORMAT (1x1, 2x1, 2x2)
  return (
    <>
      <OneUICard
        size={config.size}
        isActive={isOn}
        activeGlowColor={activeColor}
        isEditMode={isEditMode}
        isFavorite={config.isFavorite}
        onToggleFavorite={onToggleFavorite}
        onResize={onResize}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="w-full">
          {/* Top row: Icon (quick toggle) on left, Apple Home Palette Button on right */}
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
                triggerHaptic('medium');
              }}
              title={isOn ? 'Desligar' : 'Ligar'}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                isOn ? 'shadow-lg hover:scale-105' : 'bg-white/5 text-slate-400'
              }`}
              style={
                isOn
                  ? {
                      backgroundColor: `${activeColor}33`,
                      color: activeColor,
                      boxShadow: `0 0 16px ${activeColor}55`,
                    }
                  : undefined
              }
            >
              <DynamicIcon
                name={config.customIcon}
                defaultIcon={Lightbulb}
                size={20}
                className={isOn ? 'filter drop-shadow-[0_0_6px_currentColor]' : ''}
              />
            </button>

            {/* Apple Home Style Color Picker Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailModalOpen(true);
              }}
              title="Ajustar cores e temperatura (Apple Home)"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white shrink-0 border border-white/10 shadow-sm"
            >
              <Palette size={15} style={isOn ? { color: activeColor } : undefined} />
            </button>
          </div>

          {/* Device Name below the icon row */}
          <div className="mt-2.5 min-w-0">
            <h3 className="font-medium text-sm sm:text-base text-white truncate leading-tight">
              {name}
            </h3>
          </div>

          {/* Integrated One UI Full-Width Dimmer Track (matching exact light color) */}
          <div
            draggable={false}
            onDragStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="mt-3 touch-none cursor-ew-resize py-1"
            title="Deslize horizontalmente para ajustar o brilho"
          >
            <div className="relative w-full h-5 rounded-full bg-white/10 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full transition-[width] duration-75"
                style={{
                  width: `${displayBrightness}%`,
                  backgroundColor: isOn ? activeColor : 'rgba(255, 255, 255, 0.2)',
                  boxShadow: isOn ? `0 0 14px ${activeColor}99` : 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Expanded Slider for 2x2 cards */}
        {config.size === '2x2' && isOn && (
          <div className="mt-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <OneUISlider
              value={displayBrightness}
              onChange={(val) => {
                setLocalBrightness(val);
                currentBrightnessRef.current = val;
                onBrightnessChange(val);
              }}
              accentColor={activeColor}
              label="Ajuste Fino"
            />
          </div>
        )}
      </OneUICard>

      {/* Apple Home Style Modal for Color & Dimmer */}
      <LightDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        config={config}
        entity={entity}
        onToggle={onToggle}
        onBrightnessChange={onBrightnessChange}
        onColorChange={(rgb) => onColorChange?.(rgb)}
      />
    </>
  );
};
