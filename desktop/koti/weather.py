"""Clima via Open-Meteo (sem chave de API)."""
import json
import threading
import urllib.parse
import urllib.request

from gi.repository import GLib

WMO = {
    0: ("Céu limpo", "weather-clear-symbolic"),
    1: ("Predominantemente limpo", "weather-clear-symbolic"),
    2: ("Parcialmente nublado", "weather-few-clouds-symbolic"),
    3: ("Nublado", "weather-overcast-symbolic"),
    45: ("Nevoeiro", "weather-fog-symbolic"),
    48: ("Nevoeiro com geada", "weather-fog-symbolic"),
    51: ("Garoa leve", "weather-showers-scattered-symbolic"),
    53: ("Garoa moderada", "weather-showers-scattered-symbolic"),
    55: ("Garoa densa", "weather-showers-scattered-symbolic"),
    61: ("Chuva fraca", "weather-showers-symbolic"),
    63: ("Chuva moderada", "weather-showers-symbolic"),
    65: ("Chuva forte", "weather-showers-symbolic"),
    71: ("Neve fraca", "weather-snow-symbolic"),
    73: ("Neve moderada", "weather-snow-symbolic"),
    75: ("Neve forte", "weather-snow-symbolic"),
    80: ("Pancadas de chuva", "weather-showers-symbolic"),
    81: ("Pancadas moderadas", "weather-showers-symbolic"),
    82: ("Temporal de chuva", "weather-storm-symbolic"),
    95: ("Tempestade com raios", "weather-storm-symbolic"),
    96: ("Tempestade com granizo", "weather-storm-symbolic"),
    99: ("Tempestade severa", "weather-storm-symbolic"),
}


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "koti"})
    with urllib.request.urlopen(req, timeout=8) as r:
        return json.loads(r.read().decode())


def fetch(city, callback):
    """Busca em thread; callback(dict | None) na thread principal."""

    def work():
        lat, lon, name = -23.5505, -46.6333, city or "Sua região"
        if city and city.strip():
            geo = _get("https://geocoding-api.open-meteo.com/v1/search?name="
                       f"{urllib.parse.quote(city.strip())}&count=1&language=pt&format=json")
            if geo.get("results"):
                r = geo["results"][0]
                lat, lon, name = r["latitude"], r["longitude"], r["name"]
                if r.get("admin1"):
                    name += f", {r['admin1']}"
        d = _get("https://api.open-meteo.com/v1/forecast?"
                 f"latitude={lat}&longitude={lon}&timezone=auto"
                 "&current=temperature_2m,relative_humidity_2m,apparent_temperature,"
                 "weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min")
        cur, daily = d["current"], d.get("daily", {})
        text, icon = WMO.get(cur.get("weather_code", 0), ("Parcialmente nublado", "weather-few-clouds-symbolic"))
        return {
            "city": name, "text": text, "icon": icon,
            "temp": round(cur["temperature_2m"]), "feels": round(cur["apparent_temperature"]),
            "humidity": round(cur["relative_humidity_2m"]), "wind": round(cur["wind_speed_10m"]),
            "max": round(daily["temperature_2m_max"][0]) if daily.get("temperature_2m_max") else None,
            "min": round(daily["temperature_2m_min"][0]) if daily.get("temperature_2m_min") else None,
        }

    def runner():
        try:
            res = work()
        except Exception:
            res = None
        GLib.idle_add(callback, res)

    threading.Thread(target=runner, daemon=True).start()
