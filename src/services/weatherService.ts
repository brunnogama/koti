import { WeatherData } from '../types/dashboard';

const WMO_CODES: Record<number, { text: string; icon: string }> = {
  0: { text: 'Céu Limpo', icon: 'Sun' },
  1: { text: 'Predominantemente Ensolarado', icon: 'Sun' },
  2: { text: 'Parcialmente Nublado', icon: 'CloudSun' },
  3: { text: 'Nublado', icon: 'Cloud' },
  45: { text: 'Nevoeiro', icon: 'CloudFog' },
  48: { text: 'Nevoeiro com Geada', icon: 'CloudFog' },
  51: { text: 'Garoa Leve', icon: 'CloudDrizzle' },
  53: { text: 'Garoa Moderada', icon: 'CloudDrizzle' },
  55: { text: 'Garoa Densa', icon: 'CloudDrizzle' },
  61: { text: 'Chuva Fraca', icon: 'CloudRain' },
  63: { text: 'Chuva Moderada', icon: 'CloudRain' },
  65: { text: 'Chuva Forte', icon: 'CloudRain' },
  71: { text: 'Neve Fraca', icon: 'Snowflake' },
  73: { text: 'Neve Moderada', icon: 'Snowflake' },
  75: { text: 'Neve Forte', icon: 'Snowflake' },
  80: { text: 'Pancadas de Chuva', icon: 'CloudRain' },
  81: { text: 'Pancadas Moderadas', icon: 'CloudRain' },
  82: { text: 'Temporal de Chuva', icon: 'CloudLightning' },
  95: { text: 'Tempestade com Raios', icon: 'CloudLightning' },
  96: { text: 'Tempestade com Granizo', icon: 'CloudLightning' },
  99: { text: 'Tempestade Severa', icon: 'CloudLightning' },
};

const DEFAULT_WEATHER: WeatherData = {
  temperature: 24,
  apparentTemperature: 25,
  conditionCode: 2,
  conditionText: 'Parcialmente Nublado',
  cityName: 'São Paulo',
  humidity: 62,
  windSpeed: 14,
  tempMax: 28,
  tempMin: 19,
  isDay: true,
};

export const weatherService = {
  async getWeather(customCity?: string): Promise<WeatherData> {
    try {
      let lat = -23.5505;
      let lon = -46.6333;
      let cityName = customCity || 'Sua Região';

      if (customCity && customCity.trim().length > 0) {
        // Geocode city
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            customCity.trim()
          )}&count=1&language=pt&format=json`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            cityName = geoData.results[0].name;
            if (geoData.results[0].admin1) {
              cityName += `, ${geoData.results[0].admin1}`;
            }
          }
        }
      } else if (navigator.geolocation) {
        // Try browser geolocation
        const pos = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p),
            () => resolve(null),
            { timeout: 4000 }
          );
        });

        if (pos) {
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          cityName = 'Localização Atual';
        }
      }

      // Fetch forecast from Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API failed');

      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const code = current.weather_code ?? 0;
      const wmoInfo = WMO_CODES[code] || { text: 'Parcialmente Nublado', icon: 'CloudSun' };

      return {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        conditionCode: code,
        conditionText: wmoInfo.text,
        cityName,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        tempMax: daily?.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : undefined,
        tempMin: daily?.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : undefined,
        isDay: current.is_day === 1,
      };
    } catch (e) {
      console.warn('[Koti Weather] Using fallback weather data', e);
      return {
        ...DEFAULT_WEATHER,
        cityName: customCity || DEFAULT_WEATHER.cityName,
      };
    }
  },
};
