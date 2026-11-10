"""Cliente do Home Assistant (WebSocket via libsoup3 + REST em threads)."""
import json
import re
import threading
import urllib.error
import urllib.request
from datetime import datetime, timezone

import gi

gi.require_version("Soup", "3.0")
from gi.repository import Gio, GLib, GObject, Soup  # noqa: E402


def normalize_host(raw):
    raw = raw.strip()
    secure = bool(re.match(r"^(https|wss)://", raw, re.I))
    host = re.sub(r"^(https?|wss?)://", "", raw, flags=re.I).rstrip("/")
    return host, secure


def _http_json(url, token, method="GET", body=None, timeout=5):
    req = urllib.request.Request(
        url, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode() or "null")


def test_connection(raw_host, token, callback):
    """Testa em thread; callback(dict) roda na thread principal."""

    def work():
        host, secure = normalize_host(raw_host)
        if not host:
            return {"ok": False, "error": "Informe o endereço do Home Assistant."}
        if not token.strip():
            return {"ok": False, "error": "Informe o token de acesso."}
        typed_port = bool(re.search(r":\d+$", host))
        bare = re.sub(r":\d+$", "", host)
        candidates = [host] if (typed_port or secure) else [bare, f"{bare}:8123"]
        for cand in candidates:
            base = f"{'https' if secure else 'http'}://{cand}"
            try:
                cfg = _http_json(f"{base}/api/config", token.strip())
                try:
                    states = _http_json(f"{base}/api/states", token.strip())
                except Exception:
                    states = []
                return {"ok": True, "host": cand, "version": cfg.get("version", "?"),
                        "location": cfg.get("location_name", ""), "total": len(states)}
            except urllib.error.HTTPError as e:
                if e.code == 401:
                    return {"ok": False, "error": f"Home Assistant encontrado em {cand}, mas o token é "
                            "inválido ou foi revogado."}
            except Exception:
                pass
        return {"ok": False, "error": f"Não foi possível alcançar {' nem '.join(candidates)}. "
                "Verifique o endereço e se está na mesma rede."}

    def runner():
        res = work()
        GLib.idle_add(callback, res)

    threading.Thread(target=runner, daemon=True).start()


def _now():
    return datetime.now(timezone.utc).isoformat()


def _demo_entities():
    def ent(eid, state, **attrs):
        return {"entity_id": eid, "state": state, "attributes": attrs,
                "last_changed": _now(), "last_updated": _now()}
    return {e["entity_id"]: e for e in [
        ent("light.living_room_main", "on", friendly_name="Luz Central", brightness=210,
            rgb_color=[255, 200, 120], supported_color_modes=["rgb"]),
        ent("light.bedroom_lamp", "on", friendly_name="Abajur", brightness=90,
            supported_color_modes=["brightness"]),
        ent("switch.coffee_maker", "off", friendly_name="Cafeteira"),
        ent("sensor.living_room_temp", "23.4", friendly_name="Temperatura da Sala",
            unit_of_measurement="°C", device_class="temperature"),
        ent("climate.living_room_ac", "cool", friendly_name="Ar-condicionado", temperature=23,
            current_temperature=25, hvac_action="cooling"),
        ent("scene.movie_night", "scening", friendly_name="Noite de Cinema"),
    ]}


class HAClient(GObject.Object):
    __gsignals__ = {
        "state-changed": (GObject.SignalFlags.RUN_FIRST, None, (str, object)),
        "status": (GObject.SignalFlags.RUN_FIRST, None, (str,)),
    }
    # status: disconnected | connecting | connected | auth_failed

    def __init__(self):
        super().__init__()
        self.entities = {}
        self.status = "disconnected"
        self._session = Soup.Session()
        self._conn = None
        self._cancel = None
        self._cfg = None
        self._gen = 0
        self._msg_id = 1
        self._ping_src = 0
        self._reconnect_src = 0
        self._attempts = 0
        self._last_pong = 0.0
        self._intentional = False

    def _set_status(self, s):
        self.status = s
        self.emit("status", s)

    # --- ciclo de vida -------------------------------------------------
    def connect_to(self, cfg):
        self.disconnect_ha(quiet=True)
        self._cfg = cfg
        self._intentional = False
        self._gen += 1
        if cfg.get("demo"):
            self.entities = _demo_entities()
            self._set_status("connected")
            for eid, st in self.entities.items():
                self.emit("state-changed", eid, st)
            return
        if not cfg.get("host") or not cfg.get("token"):
            self._set_status("disconnected")
            return
        host, secure = normalize_host(cfg["host"])
        self._set_status("connecting")
        try:
            msg = Soup.Message.new("GET", f"{'wss' if secure else 'ws'}://{host}/api/websocket")
        except Exception:
            self._set_status("disconnected")
            return
        if msg is None:
            self._set_status("disconnected")
            return
        gen = self._gen
        self._cancel = Gio.Cancellable()
        self._session.websocket_connect_async(
            msg, None, None, GLib.PRIORITY_DEFAULT, self._cancel, self._on_ws_ready, gen)

    def disconnect_ha(self, quiet=False):
        self._intentional = True
        self._gen += 1
        for attr in ("_ping_src", "_reconnect_src"):
            if getattr(self, attr):
                GLib.source_remove(getattr(self, attr))
                setattr(self, attr, 0)
        if self._cancel:
            self._cancel.cancel()
            self._cancel = None
        if self._conn:
            try:
                self._conn.close(1000, None)
            except Exception:
                pass
            self._conn = None
        if not quiet:
            self._set_status("disconnected")

    def _on_ws_ready(self, session, res, gen):
        if gen != self._gen:
            return
        try:
            conn = session.websocket_connect_finish(res)
        except GLib.Error:
            self._set_status("disconnected")
            self._schedule_reconnect()
            return
        conn.set_keepalive_interval(0)
        conn.connect("message", self._on_message, gen)
        conn.connect("closed", self._on_closed, gen)
        conn.connect("error", lambda *_: None)
        self._conn = conn

    def _on_closed(self, conn, gen):
        if gen != self._gen:
            return
        self._conn = None
        if self._ping_src:
            GLib.source_remove(self._ping_src)
            self._ping_src = 0
        self._set_status("disconnected")
        if not self._intentional:
            self._schedule_reconnect()

    def _schedule_reconnect(self):
        if self._reconnect_src or self._intentional:
            return
        self._attempts += 1
        delay = min(2 * 1.5 ** min(self._attempts, 4), 10)

        def again():
            self._reconnect_src = 0
            if self._cfg and not self._intentional:
                self.connect_to(self._cfg)
            return False

        self._reconnect_src = GLib.timeout_add(int(delay * 1000), again)

    # --- protocolo -----------------------------------------------------
    def _send(self, payload):
        if self._conn and self._conn.get_state() == Soup.WebsocketState.OPEN:
            self._conn.send_text(json.dumps(payload))
            return True
        return False

    def _next_id(self):
        self._msg_id += 1
        return self._msg_id

    def _on_message(self, conn, typ, data, gen):
        if gen != self._gen or typ != Soup.WebsocketDataType.TEXT:
            return
        try:
            msg = json.loads(data.get_data().decode())
        except ValueError:
            return
        t = msg.get("type")
        if t == "auth_required":
            self._send({"type": "auth", "access_token": self._cfg["token"].strip()})
        elif t == "auth_ok":
            self._attempts = 0
            self._set_status("connected")
            self._send({"id": self._next_id(), "type": "get_states"})
            self._send({"id": self._next_id(), "type": "subscribe_events",
                        "event_type": "state_changed"})
            self._last_pong = GLib.get_monotonic_time() / 1e6
            self._ping_src = GLib.timeout_add_seconds(25, self._ping)
        elif t == "auth_invalid":
            self._intentional = True  # token ruim: não adianta reconectar
            self._set_status("auth_failed")
        elif t == "pong":
            self._last_pong = GLib.get_monotonic_time() / 1e6
        elif t == "event" and msg.get("event", {}).get("event_type") == "state_changed":
            d = msg["event"]["data"]
            if d.get("new_state"):
                self._store(d["entity_id"], d["new_state"])
        elif t == "result" and isinstance(msg.get("result"), list):
            for st in msg["result"]:
                if isinstance(st, dict) and "entity_id" in st:
                    self._store(st["entity_id"], st)

    def _store(self, eid, state):
        self.entities[eid] = state
        self.emit("state-changed", eid, state)

    def _ping(self):
        if GLib.get_monotonic_time() / 1e6 - self._last_pong > 50 and self._conn:
            self._conn.close(1000, None)  # conexão morta; _on_closed reconecta
            return False
        self._send({"id": self._next_id(), "type": "ping"})
        return True

    # --- ações ---------------------------------------------------------
    def call_service(self, domain, service, data=None):
        data = data or {}
        if self._cfg and self._cfg.get("demo"):
            self._demo_call(service, data)
            return
        if self._send({"id": self._next_id(), "type": "call_service", "domain": domain,
                       "service": service, "service_data": data}):
            return
        if self._cfg and self._cfg.get("token") and self._cfg.get("host"):
            host, secure = normalize_host(self._cfg["host"])
            url = f"{'https' if secure else 'http'}://{host}/api/services/{domain}/{service}"
            threading.Thread(target=lambda: _safe(
                lambda: _http_json(url, self._cfg["token"].strip(), "POST", data)), daemon=True).start()

    def _demo_call(self, service, data):
        eid = data.get("entity_id")
        cur = self.entities.get(eid)
        if not cur:
            return
        new = json.loads(json.dumps(cur))
        if service == "turn_on":
            new["state"] = "on"
            for k in ("brightness", "rgb_color"):
                if k in data:
                    new["attributes"][k] = data[k]
        elif service == "turn_off":
            new["state"] = "off"
        elif service == "toggle":
            new["state"] = "off" if cur["state"] == "on" else "on"
        elif service == "set_temperature" and "temperature" in data:
            new["attributes"]["temperature"] = data["temperature"]
        new["last_updated"] = _now()
        self._store(eid, new)

    def toggle(self, eid):
        domain = eid.split(".")[0]
        if domain == "scene":
            self.call_service("scene", "turn_on", {"entity_id": eid})
        else:
            self.call_service(domain, "toggle", {"entity_id": eid})

    def set_power(self, eid, on):
        self.call_service(eid.split(".")[0], "turn_on" if on else "turn_off", {"entity_id": eid})

    def set_brightness(self, eid, pct):
        pct = max(0, min(100, int(pct)))
        if pct == 0:
            self.set_power(eid, False)
        else:
            self.call_service("light", "turn_on", {"entity_id": eid, "brightness": round(pct * 2.55)})

    def set_color(self, eid, rgb):
        self.call_service("light", "turn_on", {"entity_id": eid, "rgb_color": list(rgb)})

    def set_temperature(self, eid, temp):
        self.call_service("climate", "set_temperature", {"entity_id": eid, "temperature": temp})


def _safe(fn):
    try:
        fn()
    except Exception:
        pass
