import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name?: string;
  defaultIcon: React.ComponentType<{ size?: number; className?: string }>;
  size?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  defaultIcon: DefaultIcon,
  size = 24,
  className = '',
}) => {
  if (!name) {
    return <DefaultIcon size={size} className={className} />;
  }

  const FoundIcon = (Icons as any)[name];
  if (FoundIcon) {
    return <FoundIcon size={size} className={className} />;
  }

  return <DefaultIcon size={size} className={className} />;
};

export const GADGET_ICON_CATEGORIES = [
  {
    category: 'Iluminação',
    icons: [
      { name: 'Lightbulb', label: 'Lâmpada' },
      { name: 'Lamp', label: 'Abajur' },
      { name: 'LampCeiling', label: 'Lustre' },
      { name: 'LampDesk', label: 'Mesa' },
      { name: 'LampFloor', label: 'Chão' },
      { name: 'LampWallUp', label: 'Arandela' },
      { name: 'Sun', label: 'Sol' },
      { name: 'Sparkles', label: 'Fita LED' },
      { name: 'Flame', label: 'Lareira' },
      { name: 'Flashlight', label: 'Spot' },
    ],
  },
  {
    category: 'Tomadas & Aparelhos',
    icons: [
      { name: 'Power', label: 'Geral' },
      { name: 'Plug', label: 'Tomada' },
      { name: 'Zap', label: 'Energia' },
      { name: 'Tv', label: 'Televisão' },
      { name: 'Speaker', label: 'Som' },
      { name: 'Monitor', label: 'PC' },
      { name: 'Coffee', label: 'Cafeteira' },
      { name: 'Router', label: 'Roteador' },
      { name: 'Cpu', label: 'Setup' },
      { name: 'WashingMachine', label: 'Lava-Roupas' },
    ],
  },
  {
    category: 'Climatização',
    icons: [
      { name: 'Wind', label: 'Ar Condicionado' },
      { name: 'Fan', label: 'Ventilador' },
      { name: 'Thermometer', label: 'Termostato' },
      { name: 'ThermometerSnowflake', label: 'Frio' },
      { name: 'ThermometerSun', label: 'Aquecedor' },
      { name: 'Snowflake', label: 'Gelo' },
      { name: 'Waves', label: 'Umidificador' },
    ],
  },
  {
    category: 'Segurança & Sensores',
    icons: [
      { name: 'Shield', label: 'Escudo' },
      { name: 'ShieldCheck', label: 'Alarme' },
      { name: 'Lock', label: 'Fechadura' },
      { name: 'Key', label: 'Chave' },
      { name: 'DoorClosed', label: 'Porta' },
      { name: 'DoorOpen', label: 'Janela' },
      { name: 'Activity', label: 'Presença' },
      { name: 'Eye', label: 'Câmera' },
      { name: 'Bell', label: 'Campainha' },
      { name: 'Droplets', label: 'Inundação' },
    ],
  },
  {
    category: 'Ambientes & Casa',
    icons: [
      { name: 'Home', label: 'Casa' },
      { name: 'Sofa', label: 'Sala' },
      { name: 'Bed', label: 'Quarto' },
      { name: 'Bath', label: 'Banheiro' },
      { name: 'Utensils', label: 'Cozinha' },
      { name: 'Sparkle', label: 'Cenário' },
      { name: 'Moon', label: 'Noite' },
      { name: 'Film', label: 'Cinema' },
      { name: 'Heart', label: 'Favorito' },
      { name: 'Car', label: 'Garagem' },
    ],
  },
];
