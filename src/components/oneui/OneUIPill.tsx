import React from 'react';
import { RoomConfig } from '../../types/dashboard';
import * as Icons from 'lucide-react';

interface OneUIPillsProps {
  rooms: RoomConfig[];
  activeRoomId: string;
  onSelectRoom: (id: string) => void;
  onManageRooms: () => void;
  accentColor?: string;
}

export const OneUIPill: React.FC<OneUIPillsProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onManageRooms,
  accentColor = '#2C75FF',
}) => {
  const getIcon = (iconName: string) => {
    // Dynamic lucide icon
    const IconComp = (Icons as any)[iconName] || Icons.Home;
    return <IconComp size={16} />;
  };

  return (
    <div className="w-full px-6 md:px-10 mb-6">
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2">
        {rooms.map((room) => {
          const isActive = room.id === activeRoomId;
          const isFavorites = room.id === 'favorites' || room.name.toLowerCase() === 'favoritos';

          if (isFavorites) {
            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                title="Favoritos"
                className={`flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0 tv-focusable ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'oneui-glass-pill text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: accentColor,
                        boxShadow: `0 4px 20px ${accentColor}55`,
                      }
                    : undefined
                }
              >
                <Icons.Star
                  size={18}
                  fill="none"
                  strokeWidth={2}
                  className={isActive ? 'text-white' : 'text-slate-300'}
                />
              </button>
            );
          }

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap tv-focusable ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'oneui-glass-pill text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: accentColor,
                      boxShadow: `0 4px 20px ${accentColor}55`,
                    }
                  : undefined
              }
            >
              <span className={isActive ? 'text-white' : 'text-slate-400'}>
                {getIcon(room.icon)}
              </span>
              <span>{room.name}</span>
            </button>
          );
        })}

        {/* Add Room button */}
        <button
          onClick={onManageRooms}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium oneui-glass-pill text-slate-400 hover:text-white hover:bg-white/10 transition-all tv-focusable"
          title="Gerenciar Cômodos"
        >
          <Icons.Plus size={14} />
          <span>Cômodos</span>
        </button>
      </div>
    </div>
  );
};
