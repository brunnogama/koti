"""Cartões de dispositivos no estilo libadwaita."""
import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
from gi.repository import Gdk, GLib, Gtk  # noqa: E402

ICONS = {
    "light": "display-brightness-symbolic",
    "switch": "system-shutdown-symbolic",
    "climate": "weather-clear-symbolic",
    "sensor": "utilities-system-monitor-symbolic",
    "binary_sensor": "dialog-information-symbolic",
    "scene": "starred-symbolic",
}

BINARY_TEXT = {
    "door": ("Fechada", "Aberta"), "window": ("Fechada", "Aberta"),
    "motion": ("Sem movimento", "Movimento"), "presence": ("Ausente", "Presente"),
    "smoke": ("Normal", "Fumaça"), "moisture": ("Seco", "Úmido"),
    "lock": ("Trancada", "Destrancada"),
}
DEVICE_CLASS = {"temperature": "Temperatura", "humidity": "Umidade", "battery": "Bateria",
                "power": "Potência", "energy": "Energia", "illuminance": "Luminosidade",
                "pressure": "Pressão", "voltage": "Tensão", "current": "Corrente"}
HVAC_TEXT = {"cooling": "Resfriando", "heating": "Aquecendo", "idle": "Ociosa", "drying": "Desumidificando",
             "fan": "Ventilando", "off": "Desligado", "cool": "Resfriando", "heat": "Aquecendo", "auto": "Automático",
             "dry": "Desumidificando", "fan_only": "Ventilando", "heat_cool": "Aquecer/Resfriar"}


def _label(text="", css=(), xalign=0.0):
    lbl = Gtk.Label(label=text, xalign=xalign)
    for c in css:
        lbl.add_css_class(c)
    return lbl


class Card(Gtk.Box):
    """Base: ícone + título/subtítulo + controle à direita + corpo + barra de edição."""

    def __init__(self, ha, wcfg, on_edit):
        super().__init__(orientation=Gtk.Orientation.VERTICAL, spacing=12)
        self.ha, self.wcfg, self._on_edit = ha, wcfg, on_edit
        self.entity_id = wcfg["entityId"]
        self.domain = self.entity_id.split(".")[0]
        self._updating = False
        self.add_css_class("card")
        self.add_css_class("koti-card")
        self.set_size_request(280, -1)

        head = Gtk.Box(spacing=12)
        self.icon = Gtk.Image(icon_name=ICONS.get(self.domain, "dialog-information-symbolic"),
                              pixel_size=20, valign=Gtk.Align.CENTER)
        self.icon.add_css_class("koti-icon")
        head.append(self.icon)
        titles = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, hexpand=True, valign=Gtk.Align.CENTER)
        self.title = _label(css=("heading",))
        self.title.set_ellipsize(3)
        self.subtitle = _label(css=("dim-label", "caption"))
        self.subtitle.set_ellipsize(3)
        titles.append(self.title)
        titles.append(self.subtitle)
        head.append(titles)
        self.trailing = Gtk.Box(valign=Gtk.Align.CENTER)
        head.append(self.trailing)
        self.append(head)

        self.body = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
        self.append(self.body)
        self.build()

        self.edit_bar = Gtk.Box(spacing=6, halign=Gtk.Align.END)
        self.edit_bar.set_visible(False)
        for icon, tip, kind in (("go-previous-symbolic", "Mover para trás", "prev"),
                                ("go-next-symbolic", "Mover para frente", "next"),
                                ("non-starred-symbolic", "Favorito", "favorite"),
                                ("user-trash-symbolic", "Remover", "remove")):
            b = Gtk.Button(icon_name=icon, tooltip_text=tip)
            b.add_css_class("flat")
            b.add_css_class("circular")
            if kind == "remove":
                b.add_css_class("destructive-action")
            if kind == "favorite":
                self.fav_btn = b
            b.connect("clicked", lambda _b, k=kind: self._on_edit(k, self.wcfg["id"]))
            self.edit_bar.append(b)
        self.append(self.edit_bar)
        self._refresh_fav()

    # --- API pública
    def set_editing(self, on):
        self.edit_bar.set_visible(on)

    def _refresh_fav(self):
        fav = self.wcfg.get("isFavorite")
        self.fav_btn.set_icon_name("starred-symbolic" if fav else "non-starred-symbolic")

    def refresh_flags(self):
        self._refresh_fav()

    def set_state(self, st):
        attrs = st["attributes"]
        self.title.set_text(self.wcfg.get("customName") or attrs.get("friendly_name") or self.entity_id)
        unavailable = st["state"] in ("unavailable", "unknown")
        self.body.set_sensitive(not unavailable)
        self.trailing.set_sensitive(not unavailable)
        self._updating = True
        try:
            if unavailable:
                self.subtitle.set_text("Indisponível")
                self.set_active(False)
            else:
                self.update(st)
        finally:
            self._updating = False

    def set_active(self, on):
        if on:
            self.icon.remove_css_class("off")
        else:
            self.icon.add_css_class("off")

    # --- a sobrescrever
    def build(self): ...
    def update(self, st): ...


class _PowerMixin:
    def add_power_switch(self, handler):
        self.power = Gtk.Switch(valign=Gtk.Align.CENTER)
        self.power.connect("notify::active", handler)
        self.trailing.append(self.power)


class LightCard(_PowerMixin, Card):
    def build(self):
        self._timer = 0
        self.add_power_switch(lambda sw, _p: None if self._updating else
                              self.ha.set_power(self.entity_id, sw.get_active()))
        self.scale = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 1, 100, 1)
        self.scale.set_hexpand(True)
        self.scale.set_draw_value(False)
        self.scale.connect("value-changed", self._on_scale)
        row = Gtk.Box(spacing=12)
        row.append(self.scale)
        self.color_btn = Gtk.ColorDialogButton(dialog=Gtk.ColorDialog(), valign=Gtk.Align.CENTER)
        self.color_btn.connect("notify::rgba", self._on_color)
        row.append(self.color_btn)
        self.body.append(row)

    def _on_scale(self, scale):
        if self._updating:
            return
        if self._timer:
            GLib.source_remove(self._timer)

        def fire():
            self._timer = 0
            self.ha.set_brightness(self.entity_id, scale.get_value())
            return False

        self._timer = GLib.timeout_add(200, fire)

    def _on_color(self, btn, _p):
        if self._updating:
            return
        c = btn.get_rgba()
        self.ha.set_color(self.entity_id, (round(c.red * 255), round(c.green * 255), round(c.blue * 255)))

    def update(self, st):
        a = st["attributes"]
        on = st["state"] == "on"
        self.power.set_active(on)
        self.set_active(on)
        pct = round((a.get("brightness") or 0) / 2.55)
        self.scale.set_value(max(1, pct) if on else 1)
        self.subtitle.set_text(f"{pct}%" if on else "Desligada")
        modes = a.get("supported_color_modes") or []
        has_color = bool(a.get("rgb_color")) or any(m in modes for m in ("rgb", "rgbw", "rgbww", "hs", "xy"))
        self.color_btn.set_visible(has_color)
        self.scale.set_sensitive(on or "brightness" in modes or "onoff" not in modes)
        if has_color and a.get("rgb_color"):
            r, g, b = a["rgb_color"]
            rgba = Gdk.RGBA()
            rgba.red, rgba.green, rgba.blue, rgba.alpha = r / 255, g / 255, b / 255, 1
            self.color_btn.set_rgba(rgba)


class SwitchCard(_PowerMixin, Card):
    def build(self):
        self.add_power_switch(lambda sw, _p: None if self._updating else
                              self.ha.set_power(self.entity_id, sw.get_active()))
        self.body.set_visible(False)

    def update(self, st):
        on = st["state"] == "on"
        self.power.set_active(on)
        self.set_active(on)
        self.subtitle.set_text("Ligado" if on else "Desligado")


class SensorCard(Card):
    def build(self):
        self.value = _label(css=("title-1", "numeric"))
        self.body.append(self.value)

    def update(self, st):
        a = st["attributes"]
        if self.domain == "binary_sensor":
            off, on = BINARY_TEXT.get(a.get("device_class"), ("Inativo", "Ativo"))
            is_on = st["state"] == "on"
            self.value.set_text(on if is_on else off)
            self.set_active(is_on)
            self.subtitle.set_text("Sensor binário")
        else:
            unit = a.get("unit_of_measurement") or ""
            self.value.set_text(f"{st['state']} {unit}".strip())
            dc = a.get("device_class")
            self.subtitle.set_text(DEVICE_CLASS.get(dc, (dc or "Sensor").replace("_", " ").capitalize()))
            self.set_active(True)


class ClimateCard(_PowerMixin, Card):
    def build(self):
        self.add_power_switch(lambda sw, _p: None if self._updating else self.ha.call_service(
            "climate", "turn_on" if sw.get_active() else "turn_off", {"entity_id": self.entity_id}))
        row = Gtk.Box(spacing=12, halign=Gtk.Align.CENTER)
        minus = Gtk.Button(icon_name="list-remove-symbolic")
        minus.add_css_class("circular")
        plus = Gtk.Button(icon_name="list-add-symbolic")
        plus.add_css_class("circular")
        self.target = _label(css=("title-1", "numeric"), xalign=0.5)
        self._t = 22.0
        minus.connect("clicked", lambda *_: self._step(-0.5))
        plus.connect("clicked", lambda *_: self._step(0.5))
        for w in (minus, self.target, plus):
            row.append(w)
        self.body.append(row)

    def _step(self, d):
        self._t = max(7.0, min(35.0, self._t + d))
        self.target.set_text(f"{self._t:g}°")
        self.ha.set_temperature(self.entity_id, self._t)

    def update(self, st):
        a = st["attributes"]
        on = st["state"] != "off"
        self.power.set_active(on)
        self.set_active(on)
        if a.get("temperature") is not None:
            self._t = float(a["temperature"])
        self.target.set_text(f"{self._t:g}°")
        cur = a.get("current_temperature")
        action = HVAC_TEXT.get(a.get("hvac_action") or st["state"], st["state"])
        self.subtitle.set_text(f"Atual {cur:g}° · {action}" if cur is not None else action)


class SceneCard(Card):
    def build(self):
        btn = Gtk.Button(label="Ativar")
        btn.add_css_class("suggested-action")
        btn.add_css_class("pill")
        btn.connect("clicked", lambda *_: self.ha.call_service("scene", "turn_on", {"entity_id": self.entity_id}))
        self.trailing.append(btn)
        self.body.set_visible(False)

    def update(self, st):
        self.subtitle.set_text("Cenário")
        self.set_active(True)


class WeatherCard(Card):
    def __init__(self, ha, wcfg, on_edit):
        super().__init__(ha, wcfg, on_edit)
        self.title.set_text("Clima")

    def build(self):
        self.icon.set_from_icon_name("weather-few-clouds-symbolic")
        self.temp = _label("--°", css=("title-1", "numeric"))
        self.detail = _label(css=("dim-label",))
        self.extra = _label(css=("caption", "dim-label"))
        for w in (self.temp, self.detail, self.extra):
            self.body.append(w)

    def set_weather(self, w):
        if not w:
            self.subtitle.set_text("Sem dados")
            return
        self.title.set_text(w["city"])
        self.subtitle.set_text(w["text"])
        self.icon.set_from_icon_name(w["icon"])
        self.temp.set_text(f"{w['temp']}°")
        hi = f" · máx {w['max']}° mín {w['min']}°" if w["max"] is not None else ""
        self.detail.set_text(f"Sensação {w['feels']}°{hi}")
        self.extra.set_text(f"Umidade {w['humidity']}% · Vento {w['wind']} km/h")


CARD_TYPES = {"light": LightCard, "switch": SwitchCard, "sensor": SensorCard,
              "binary_sensor": SensorCard, "climate": ClimateCard, "scene": SceneCard,
              "weather": WeatherCard}


def make_card(ha, wcfg, on_edit):
    domain = wcfg["entityId"].split(".")[0]
    cls = CARD_TYPES.get(domain)
    return cls(ha, wcfg, on_edit) if cls else None
