import React, { useRef, useState, useEffect } from 'react';

interface AdwScaleProps {
  value: number; // 0 to 100
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  accentColor?: string;
  className?: string;
}

export const AdwScale: React.FC<AdwScaleProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  accentColor = '#3584e4',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
    }
  }, [value, isDragging]);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return internalValue;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    return Math.min(max, Math.max(min, steppedVal));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.stopPropagation();
    const track = e.currentTarget;
    try {
      track.setPointerCapture(e.pointerId);
    } catch (_) {}
    setIsDragging(true);
    const newVal = calculateValue(e.clientX);
    setInternalValue(newVal);
    onChange(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    e.stopPropagation();
    const newVal = calculateValue(e.clientX);
    setInternalValue(newVal);
    onChange(newVal);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const percent = Math.max(0, Math.min(100, ((internalValue - min) / (max - min)) * 100));

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`group relative flex items-center h-7 select-none cursor-pointer touch-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      {/* Background Track */}
      <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden relative">
        {/* Filled Track */}
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{
            width: `${percent}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>

      {/* Slider Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-md border border-black/20 group-hover:scale-110 group-active:scale-95 transition-transform"
        style={{
          left: `${percent}%`,
        }}
      />
    </div>
  );
};
