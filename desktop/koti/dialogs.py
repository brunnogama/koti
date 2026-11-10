"""Diálogos: preferências, adicionar dispositivo, nome de cômodo."""
import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
from gi.repository import Adw, Gtk  # noqa: E402

from . import ha as hamod  # noqa: E402

ADD_DOMAINS = ("light", "switch", "climate", "sensor", "binary_sensor", "scene")
DOMAIN_LABEL = {"light": "Luz", "switch": "Interruptor", "climate": "Clima",
                "sensor": "Sensor", "binary_sensor": "Sensor binário", "scene": "Cenário"}


class PreferencesDialog(Adw.PreferencesDialog):
    def __init__(self, cfg, layout, on_save_connection, on_save_profile, on_reset_layout):
        super().__init__(title="Preferências")
        self._cfg = cfg
        self._on_save_connection = on_save_connection
        self._on_save_profile = on_save_profile
        page = Adw.PreferencesPage(title="Geral", icon_name="preferences-system-symbolic")

        conn = Adw.PreferencesGroup(title="Home Assistant",
                                    description="Gere um token em Perfil › Segurança › Tokens de acesso de longa duração.")
        self.host = Adw.EntryRow(title="Endereço (ex.: 192.168.1.10 ou homeassistant.local:8123)")
        self.host.set_text(cfg.get("host", ""))
        self.token = Adw.PasswordEntryRow(title="Token de acesso")
        self.token.set_text(cfg.get("token", ""))
        self.demo = Adw.SwitchRow(title="Modo demonstração",
                                  subtitle="Usa dispositivos fictícios, sem conectar")
        self.demo.set_active(cfg.get("demo", False))
        for r in (self.host, self.token, self.demo):
            conn.add(r)
        self.test_row = Adw.ActionRow(title="Testar conexão", subtitle="Verifica o endereço e o token")
        self.spinner = Gtk.Spinner(visible=False)
        self.test_btn = Gtk.Button(label="Testar", valign=Gtk.Align.CENTER)
        self.test_btn.connect("clicked", self._test)
        self.test_row.add_suffix(self.spinner)
        self.test_row.add_suffix(self.test_btn)
        conn.add(self.test_row)
        page.add(conn)

        prof = Adw.PreferencesGroup(title="Perfil")
        self.name = Adw.EntryRow(title="Seu nome")
        self.name.set_text(layout.data.get("userName", ""))
        self.city = Adw.EntryRow(title="Cidade para o clima (opcional)")
        self.city.set_text(layout.data.get("city", ""))
        prof.add(self.name)
        prof.add(self.city)
        page.add(prof)

        data = Adw.PreferencesGroup(title="Dados")
        reset = Adw.ButtonRow(title="Restaurar layout padrão")
        reset.add_css_class("destructive-action")
        reset.connect("activated", lambda *_: (on_reset_layout(), self.close()))
        data.add(reset)
        page.add(data)
        self.add(page)
        self.connect("closed", self._closed)

    def _test(self, *_):
        self.spinner.set_visible(True)
        self.spinner.start()
        self.test_btn.set_sensitive(False)
        self.test_row.set_subtitle("Testando…")
        hamod.test_connection(self.host.get_text(), self.token.get_text(), self._tested)

    def _tested(self, r):
        self.spinner.stop()
        self.spinner.set_visible(False)
        self.test_btn.set_sensitive(True)
        if r["ok"]:
            loc = f" — {r['location']}" if r["location"] else ""
            self.test_row.set_subtitle(f"Conectado a {r['host']}: versão {r['version']}{loc}, "
                                       f"{r['total']} entidades")
        else:
            self.test_row.set_subtitle(r["error"])

    def _closed(self, *_):
        self._on_save_connection({"host": self.host.get_text().strip(),
                                  "token": self.token.get_text().strip(),
                                  "demo": self.demo.get_active()})
        self._on_save_profile(self.name.get_text().strip(), self.city.get_text().strip())


class AddDeviceDialog(Adw.Dialog):
    def __init__(self, entities, existing_ids, on_pick):
        super().__init__(title="Adicionar dispositivo", content_width=480, content_height=560)
        self._on_pick = on_pick
        view = Adw.ToolbarView()
        view.add_top_bar(Adw.HeaderBar())
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12,
                      margin_start=12, margin_end=12, margin_bottom=12, margin_top=6)
        self.search = Gtk.SearchEntry(placeholder_text="Buscar por nome ou entidade")
        box.append(self.search)
        self.list = Gtk.ListBox(selection_mode=Gtk.SelectionMode.NONE)
        self.list.add_css_class("boxed-list")
        self.list.set_filter_func(self._filter)
        self.list.set_placeholder(Gtk.Label(label="Nenhum dispositivo encontrado",
                                            margin_top=24, margin_bottom=24, css_classes=["dim-label"]))
        for eid, st in sorted(entities.items(), key=lambda kv: kv[1]["attributes"].get("friendly_name", kv[0]).lower()):
            domain = eid.split(".")[0]
            if domain not in ADD_DOMAINS or eid in existing_ids:
                continue
            row = Adw.ActionRow(title=GLibEscape(st["attributes"].get("friendly_name", eid)),
                                subtitle=f"{DOMAIN_LABEL[domain]} · {eid}", activatable=True)
            row.add_suffix(Gtk.Image(icon_name="list-add-symbolic"))
            row.entity_id = eid
            row.connect("activated", lambda r: (self._on_pick(r.entity_id), self.close()))
            self.list.append(row)
        sw = Gtk.ScrolledWindow(vexpand=True, hscrollbar_policy=Gtk.PolicyType.NEVER)
        sw.set_child(self.list)
        box.append(sw)
        self.search.connect("search-changed", lambda *_: self.list.invalidate_filter())
        view.set_content(box)
        self.set_child(view)

    def _filter(self, row):
        q = self.search.get_text().lower()
        return not q or q in row.get_title().lower() or q in row.get_subtitle().lower()


def GLibEscape(s):
    from gi.repository import GLib
    return GLib.markup_escape_text(s)


def ask_room_name(parent, heading, initial, on_ok):
    dlg = Adw.AlertDialog(heading=heading)
    entry = Gtk.Entry(text=initial, activates_default=True, placeholder_text="Nome do cômodo")
    dlg.set_extra_child(entry)
    dlg.add_response("cancel", "Cancelar")
    dlg.add_response("ok", "Salvar")
    dlg.set_response_appearance("ok", Adw.ResponseAppearance.SUGGESTED)
    dlg.set_default_response("ok")
    dlg.connect("response", lambda _d, r: on_ok(entry.get_text().strip())
                if r == "ok" and entry.get_text().strip() else None)
    dlg.present(parent)
    entry.grab_focus()


def confirm(parent, heading, body, action_label, on_yes):
    dlg = Adw.AlertDialog(heading=heading, body=body)
    dlg.add_response("cancel", "Cancelar")
    dlg.add_response("yes", action_label)
    dlg.set_response_appearance("yes", Adw.ResponseAppearance.DESTRUCTIVE)
    dlg.connect("response", lambda _d, r: on_yes() if r == "yes" else None)
    dlg.present(parent)
