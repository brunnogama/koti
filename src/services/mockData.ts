import { HAEntityState } from '../types/homeAssistant';
import { DashboardLayout } from '../types/dashboard';

export const INITIAL_MOCK_ENTITIES: Record<string, HAEntityState> = {
  'light.living_room_main': {
    entity_id: 'light.living_room_main',
    state: 'on',
    attributes: {
      friendly_name: 'Luz Central',
      brightness: 210,
      rgb_color: [255, 200, 120],
      supported_features: 44,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'light.living_room_strip': {
    entity_id: 'light.living_room_strip',
    state: 'on',
    attributes: {
      friendly_name: 'Fita LED TV',
      brightness: 180,
      rgb_color: [44, 117, 255],
      supported_features: 44,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'light.bedroom_ceiling': {
    entity_id: 'light.bedroom_ceiling',
    state: 'off',
    attributes: {
      friendly_name: 'Lustre Quarto',
      brightness: 0,
      supported_features: 44,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'light.bedroom_lamp': {
    entity_id: 'light.bedroom_lamp',
    state: 'on',
    attributes: {
      friendly_name: 'Abajur',
      brightness: 90,
      rgb_color: [255, 170, 70],
      supported_features: 44,
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'switch.coffee_maker': {
    entity_id: 'switch.coffee_maker',
    state: 'off',
    attributes: {
      friendly_name: 'Cafeteira Cozinha',
      icon: 'mdi:coffee',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'switch.desk_power': {
    entity_id: 'switch.desk_power',
    state: 'on',
    attributes: {
      friendly_name: 'Filtro de Linha Setup',
      icon: 'mdi:power-socket-eu',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'climate.living_room_ac': {
    entity_id: 'climate.living_room_ac',
    state: 'cool',
    attributes: {
      friendly_name: 'Ar Condicionado',
      current_temperature: 24,
      temperature: 22,
      hvac_modes: ['off', 'cool', 'heat', 'fan_only'],
      hvac_action: 'cooling',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'sensor.living_room_temperature': {
    entity_id: 'sensor.living_room_temperature',
    state: '23.8',
    attributes: {
      friendly_name: 'Temperatura Sala',
      unit_of_measurement: '°C',
      device_class: 'temperature',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'sensor.living_room_humidity': {
    entity_id: 'sensor.living_room_humidity',
    state: '58',
    attributes: {
      friendly_name: 'Umidade Sala',
      unit_of_measurement: '%',
      device_class: 'humidity',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'binary_sensor.front_door': {
    entity_id: 'binary_sensor.front_door',
    state: 'off',
    attributes: {
      friendly_name: 'Porta Principal',
      device_class: 'door',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'binary_sensor.living_room_motion': {
    entity_id: 'binary_sensor.living_room_motion',
    state: 'on',
    attributes: {
      friendly_name: 'Presença Sala',
      device_class: 'motion',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'scene.movie_night': {
    entity_id: 'scene.movie_night',
    state: 'scening',
    attributes: {
      friendly_name: 'Modo Cinema',
      icon: 'mdi:movie-open',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
  'scene.good_night': {
    entity_id: 'scene.good_night',
    state: 'scening',
    attributes: {
      friendly_name: 'Boa Noite',
      icon: 'mdi:bed',
    },
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  },
};

export const MOCK_ENTITY_IDS = new Set([
  'light.living_room_main',
  'light.living_room_strip',
  'light.bedroom_ceiling',
  'light.bedroom_lamp',
  'switch.coffee_maker',
  'switch.desk_power',
  'climate.living_room_ac',
  'sensor.living_room_temperature',
  'sensor.living_room_humidity',
  'binary_sensor.front_door',
  'binary_sensor.living_room_motion',
  'scene.movie_night',
  'scene.good_night',
]);

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  version: 1,
  userName: 'Bruno',
  city: '',
  rooms: [
    { id: 'favorites', name: 'Favoritos', icon: 'Star', order: 0 },
    { id: 'living_room', name: 'Sala de Estar', icon: 'Sofa', order: 1 },
    { id: 'bedroom', name: 'Quarto', icon: 'Bed', order: 2 },
    { id: 'office', name: 'Escritório', icon: 'Monitor', order: 3 },
    { id: 'kitchen', name: 'Cozinha', icon: 'Utensils', order: 4 },
  ],
  widgets: [
    { id: 'w_weather', entityId: 'weather.local', roomId: 'living_room', size: '2x1', order: 0, isFavorite: true, customColor: '#06B6D4' },
  ],
  theme: {
    preset: 'oneui-dark',
    blurStrength: 'high',
    accentColor: '#2C75FF',
  },
  screensaverTimeoutMinutes: 5,
};

