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
    { id: 'w1', entityId: 'light.living_room_main', roomId: 'living_room', size: '2x1', order: 1, isFavorite: true, customColor: '#FFB020' },
    { id: 'w2', entityId: 'light.living_room_strip', roomId: 'living_room', size: '1x1', order: 2, isFavorite: true, customColor: '#2C75FF' },
    { id: 'w3', entityId: 'climate.living_room_ac', roomId: 'living_room', size: '2x2', order: 3, isFavorite: true, customColor: '#06B6D4' },
    { id: 'w4', entityId: 'sensor.living_room_temperature', roomId: 'living_room', size: '1x1', order: 4, isFavorite: true },
    { id: 'w5', entityId: 'sensor.living_room_humidity', roomId: 'living_room', size: '1x1', order: 5, isFavorite: false },
    { id: 'w6', entityId: 'binary_sensor.front_door', roomId: 'living_room', size: '1x1', order: 6, isFavorite: true },
    { id: 'w7', entityId: 'light.bedroom_ceiling', roomId: 'bedroom', size: '2x1', order: 0, isFavorite: false },
    { id: 'w8', entityId: 'light.bedroom_lamp', roomId: 'bedroom', size: '1x1', order: 1, isFavorite: true, customColor: '#F59E0B' },
    { id: 'w9', entityId: 'switch.desk_power', roomId: 'office', size: '1x1', order: 0, isFavorite: true },
    { id: 'w10', entityId: 'switch.coffee_maker', roomId: 'kitchen', size: '1x1', order: 0, isFavorite: true },
    { id: 'w11', entityId: 'scene.movie_night', roomId: 'living_room', size: '1x1', order: 7, isFavorite: true, customColor: '#8B5CF6' },
  ],
  theme: {
    preset: 'oneui-dark',
    blurStrength: 'high',
    accentColor: '#2C75FF',
  },
  screensaverTimeoutMinutes: 5,
};

