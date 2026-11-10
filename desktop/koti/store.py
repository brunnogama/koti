"""Persistência: conexão com o Home Assistant e layout do painel (JSON)."""
import copy
import json
import os

from gi.repository import GLib

from . import APP_ID

CONFIG_DIR = os.path.join(GLib.get_user_config_dir(), APP_ID)
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
LAYOUT_FILE = os.path.join(CONFIG_DIR, "layout.json")

DEFAULT_CONFIG = {"host": "", "token": "", "demo": False}

DEFAULT_LAYOUT = {
    "userName": "",
    "city": "",
    "rooms": [
        {"id": "living_room", "name": "Sala de Estar"},
        {"id": "bedroom", "name": "Quarto"},
        {"id": "office", "name": "Escritório"},
        {"id": "kitchen", "name": "Cozinha"},
    ],
    "widgets": [
        {"id": "w_weather", "entityId": "weather.local", "roomId": "living_room",
         "order": 0, "isFavorite": True},
    ],
}


def _read(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        merged = copy.deepcopy(default)
        merged.update(data)
        return merged
    except (OSError, ValueError):
        return copy.deepcopy(default)


def _write(path, data, private=False):
    os.makedirs(CONFIG_DIR, exist_ok=True)
    tmp = path + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600 if private else 0o644)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def load_config():
    return _read(CONFIG_FILE, DEFAULT_CONFIG)


def save_config(cfg):
    _write(CONFIG_FILE, cfg, private=True)  # contém o token


class Layout:
    """Salas e widgets do painel; salva a cada alteração."""

    def __init__(self):
        self.data = _read(LAYOUT_FILE, DEFAULT_LAYOUT)

    def save(self):
        _write(LAYOUT_FILE, self.data)

    def reset(self):
        self.data = copy.deepcopy(DEFAULT_LAYOUT)
        self.save()

    @property
    def rooms(self):
        return self.data["rooms"]

    @property
    def widgets(self):
        return self.data["widgets"]

    def widgets_for(self, room_id):
        if room_id == "favorites":
            ws = [w for w in self.widgets if w.get("isFavorite")]
        else:
            ws = [w for w in self.widgets if w["roomId"] == room_id]
        return sorted(ws, key=lambda w: w.get("order", 0))

    def add_widget(self, entity_id, room_id, favorite=False):
        wid = f"w_{int.from_bytes(os.urandom(4), 'big'):08x}"
        order = max([w.get("order", 0) for w in self.widgets] + [-1]) + 1
        self.widgets.append({"id": wid, "entityId": entity_id, "roomId": room_id,
                             "order": order, "isFavorite": favorite})
        self.save()

    def remove_widget(self, widget_id):
        self.data["widgets"] = [w for w in self.widgets if w["id"] != widget_id]
        self.save()

    def toggle_favorite(self, widget_id):
        for w in self.widgets:
            if w["id"] == widget_id:
                w["isFavorite"] = not w.get("isFavorite")
        self.save()

    def move_widget(self, widget_id, room_id, delta):
        ws = self.widgets_for(room_id)
        idx = next((i for i, w in enumerate(ws) if w["id"] == widget_id), None)
        if idx is None or not 0 <= idx + delta < len(ws):
            return
        a, b = ws[idx], ws[idx + delta]
        a["order"], b["order"] = b.get("order", 0), a.get("order", 0)
        self.save()

    def add_room(self, name):
        base = "".join(c if c.isalnum() else "_" for c in name.lower()).strip("_") or "room"
        rid, n = base, 1
        existing = {r["id"] for r in self.rooms}
        while rid in existing or rid == "favorites":
            n += 1
            rid = f"{base}_{n}"
        self.rooms.append({"id": rid, "name": name})
        self.save()
        return rid

    def rename_room(self, room_id, name):
        for r in self.rooms:
            if r["id"] == room_id:
                r["name"] = name
        self.save()

    def remove_room(self, room_id):
        self.data["rooms"] = [r for r in self.rooms if r["id"] != room_id]
        self.data["widgets"] = [w for w in self.widgets if w["roomId"] != room_id]
        self.save()
