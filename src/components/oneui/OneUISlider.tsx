import React from 'react';

interface OneUISliderProps {
  value: number; // 0 to 100
  onChange: (val: number) => void;
  accentColor?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const OneUISlider: React.FC<OneUISliderProps> = ({
  value,
  onChange,
  accentColor = '#2C75FF',
  label = 'Brilho',
  icon,
}) => {
  return (
    <div className="w-full mt-3">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span>{Math.round(value)}%</span>
      </div>

      <div className="relative w-full h-7 bg-white/10 rounded-full overflow-hidden p-0.5 flex items-center">
        {/* Fill Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-100"
          style={{
            width: `${Math.max(4, value)}%`,
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}88`,
          }}
        />

        {/* Transparent Range Input Overlay */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};
