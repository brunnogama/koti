import React from 'react';

interface AdwActionRowProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  suffix?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AdwActionRow: React.FC<AdwActionRowProps> = ({
  icon,
  title,
  subtitle,
  suffix,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`adw-action-row flex items-center justify-between p-3.5 gap-3.5 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-white/[0.09]' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/90 shrink-0">
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-medium text-white truncate leading-snug">
            {title}
          </span>
          {subtitle && (
            <span className="text-[12px] text-white/60 truncate leading-snug">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {suffix && <div className="flex items-center shrink-0">{suffix}</div>}
    </div>
  );
};
