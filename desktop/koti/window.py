"""Janela principal: sidebar de cômodos + conteúdo em cartões."""
from datetime import datetime

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
from gi.repository import Adw, Gio, GLib, GObject, Gtk  # noqa: E402

from . import weather
from .cards import WeatherCard, make_card
from .dialogs import AddDeviceDialog, ask_room_name, confirm

SCENES = "__scenes"
STATUS_TEXT = {
    "disconnected": "Sem conexão com o Home Assistant",
    "connecting": "Conectando ao Home Assistant…",
    "auth_failed": "Token recusado pelo Home Assistant",
}


class KotiWindow(Adw.ApplicationWindow):
    def __init__(self, app, ha, layout, open_prefs):
        super().__init__(application=app, title="Koti", default_width=1100, default_height=720)
        self.set_size_request(360, 400)
        self.ha, self.layout, self._open_prefs = ha, layout, open_prefs
        self.page_id = "favorites"
        self.editing = False
        self.cards = {}  # entity_id -> [Card]
        self.weather_cards = []
        self.weather_data = None

        self.toast = Adw.ToastOverlay()
        self.split = Adw.OverlaySplitView(min_sidebar_width=220, max_sidebar_width=280)
        self.toast.set_child(self.split)
        self.set_content(self.toast)

        # breakpoint: sidebar vira overlay em janelas estreitas
        bp = Adw.Breakpoint.new(Adw.BreakpointCondition.parse("max-width: 720sp"))
        bp.add_setter(self.split, "collapsed", True)
        self.add_breakpoint(bp)

        self._build_sidebar()
        self._build_content()
        self.rebuild_sidebar()
        self.show_page("favorites")

        ha.connect("state-changed", self._on_state)
        ha.connect("status", self._on_status)
        self._on_status(ha, ha.status)
        self.refresh_weather()
        GLib.timeout_add_seconds(20 * 60, lambda: (self.refresh_weather(), True)[1])

    # ---------------------------------------------------------------- sidebar
    def _build_sidebar(self):
        view = Adw.ToolbarView()
        hb = Adw.HeaderBar()
        hb.set_title_widget(Adw.WindowTitle(title="Koti", subtitle=""))
        view.add_top_bar(hb)
        self.sidebar_list = Gtk.ListBox(selection_mode=Gtk.SelectionMode.SINGLE)
        self.sidebar_list.add_css_class("navigation-sidebar")
        self.sidebar_list.connect("row-selected", self._on_row_selected)
        sw = Gtk.ScrolledWindow(vexpand=True, hscrollbar_policy=Gtk.PolicyType.NEVER)
        sw.set_child(self.sidebar_list)
        view.set_content(sw)
        add_room = Gtk.Button(label="Novo cômodo", margin_start=12, margin_end=12,
                              margin_top=6, margin_bottom=12)
        add_room.add_css_class("flat")
        add_room.set_icon_name("list-add-symbolic")
        add_room.set_child(Adw.ButtonContent(icon_name="list-add-symbolic", label="Novo cômodo"))
        add_room.connect("clicked", lambda *_: ask_room_name(
            self, "Novo cômodo", "", lambda n: self._room_added(n)))
        view.add_bottom_bar(add_room)
        self.split.set_sidebar(view)

    def _sidebar_row(self, pid, icon, name, editable=False):
        row = Gtk.ListBoxRow()
        row.pid = pid
        box = Gtk.Box(spacing=12, margin_top=10, margin_bottom=10, margin_start=6, margin_end=6)
        box.append(Gtk.Image(icon_name=icon))
        lbl = Gtk.Label(label=name, xalign=0, hexpand=True, ellipsize=3)
        box.append(lbl)
        if editable and self.editing:
            for ic, tip, fn in (("document-edit-symbolic", "Renomear", lambda *_: ask_room_name(
                                    self, "Renomear cômodo", name, lambda n: self._room_renamed(pid, n))),
                                ("user-trash-symbolic", "Remover", lambda *_: confirm(
                                    self, f"Remover “{name}”?",
                                    "Os dispositivos deste cômodo também saem do painel.", "Remover",
                                    lambda: self._room_removed(pid)))):
                b = Gtk.Button(icon_name=ic, tooltip_text=tip)
                b.add_css_class("flat")
                b.add_css_class("circular")
                b.connect("clicked", fn)
                box.append(b)
        row.set_child(box)
        return row

    def rebuild_sidebar(self):
        child = self.sidebar_list.get_first_child()
        while child:
            nxt = child.get_next_sibling()
            self.sidebar_list.remove(child)
            child = nxt
        rows = [self._sidebar_row("favorites", "starred-symbolic", "Favoritos")]
        rows += [self._sidebar_row(r["id"], "go-home-symbolic", r["name"], True) for r in self.layout.rooms]
        rows.append(self._sidebar_row(SCENES, "emblem-system-symbolic", "Cenários"))
        for r in rows:
            self.sidebar_list.append(r)
            if r.pid == self.page_id:
                self.sidebar_list.select_row(r)

    def _on_row_selected(self, _lb, row):
        if row is not None and row.pid != self.page_id:
            self.show_page(row.pid)
            self.split.set_show_sidebar(False) if self.split.get_collapsed() else None

    # ---------------------------------------------------------------- conteúdo
    def _build_content(self):
        view = Adw.ToolbarView()
        hb = Adw.HeaderBar()
        toggle = Gtk.ToggleButton(icon_name="sidebar-show-symbolic", tooltip_text="Cômodos")
        toggle.bind_property("active", self.split, "show-sidebar",
                             GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE)
        hb.pack_start(toggle)
        self.win_title = Adw.WindowTitle(title="Favoritos", subtitle="")
        hb.set_title_widget(self.win_title)

        menu = Gio.Menu()
        menu.append("Preferências", "app.preferences")
        menu.append("Sobre o Koti", "app.about")
        menu.append("Sair", "app.quit")
        hb.pack_end(Gtk.MenuButton(icon_name="open-menu-symbolic", menu_model=menu,
                                   primary=True, tooltip_text="Menu principal"))
        self.edit_btn = Gtk.ToggleButton(icon_name="document-edit-symbolic", tooltip_text="Editar painel")
        self.edit_btn.connect("toggled", self._on_edit_toggled)
        hb.pack_end(self.edit_btn)
        self.add_btn = Gtk.Button(icon_name="list-add-symbolic", tooltip_text="Adicionar dispositivo")
        self.add_btn.connect("clicked", lambda *_: self.add_device())
        hb.pack_end(self.add_btn)
        view.add_top_bar(hb)

        self.banner = Adw.Banner(button_label="Preferências")
        self.banner.connect("button-clicked", lambda *_: self._open_prefs())
        view.add_top_bar(self.banner)

        self.stack = Gtk.Stack(transition_type=Gtk.StackTransitionType.CROSSFADE)
        view.set_content(self.stack)

        # grade de cartões
        self.greeting = Gtk.Label(xalign=0, css_classes=["title-1"], wrap=True)
        self.flow = Gtk.FlowBox(selection_mode=Gtk.SelectionMode.NONE, homogeneous=True,
                                column_spacing=12, row_spacing=12, min_children_per_line=1,
                                max_children_per_line=6, valign=Gtk.Align.START)
        col = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=18, margin_top=18,
                      margin_bottom=24, margin_start=12, margin_end=12)
        col.append(self.greeting)
        col.append(self.flow)
        clamp = Adw.Clamp(maximum_size=1400, tightening_threshold=1000, child=col)
        sw = Gtk.ScrolledWindow(hscrollbar_policy=Gtk.PolicyType.NEVER)
        sw.set_child(clamp)
        self.stack.add_named(sw, "grid")

        self.empty = Adw.StatusPage(icon_name="view-grid-symbolic", title="Nenhum dispositivo aqui",
                                    description="Adicione luzes, interruptores, sensores e mais.")
        btn = Gtk.Button(label="Adicionar dispositivo", halign=Gtk.Align.CENTER)
        btn.add_css_class("suggested-action")
        btn.add_css_class("pill")
        btn.connect("clicked", lambda *_: self.add_device())
        self.empty.set_child(btn)
        self.stack.add_named(self.empty, "empty")

        # cenários do HA
        self.scene_group = Adw.PreferencesGroup(title="Cenários",
                                                description="Cenários configurados no Home Assistant")
        sp = Adw.PreferencesPage()
        sp.add(self.scene_group)
        self.scene_status = Adw.StatusPage(icon_name="emblem-system-symbolic",
                                           title="Nenhum cenário", description="Crie cenários no Home Assistant.")
        self.scene_rows = []
        self.stack.add_named(sp, "scenes")
        self.stack.add_named(self.scene_status, "scenes-empty")
        self.split.set_content(view)

    def show_page(self, pid):
        self.page_id = pid
        if pid == SCENES:
            self.win_title.set_title("Cenários")
            self.add_btn.set_visible(False)
            self.edit_btn.set_visible(False)
            self.refresh_scenes()
        else:
            name = "Favoritos" if pid == "favorites" else next(
                (r["name"] for r in self.layout.rooms if r["id"] == pid), "Cômodo")
            self.win_title.set_title(name)
            self.add_btn.set_visible(True)
            self.edit_btn.set_visible(True)
            self.rebuild_grid()
        self._update_subtitle()
        for r in self._rows():
            if r.pid == pid and not r.is_selected():
                self.sidebar_list.select_row(r)

    def _rows(self):
        c = self.sidebar_list.get_first_child()
        while c:
            yield c
            c = c.get_next_sibling()

    def _greeting_text(self):
        h = datetime.now().hour
        base = "Bom dia" if h < 12 else "Boa tarde" if h < 18 else "Boa noite"
        n = self.layout.data.get("userName", "")
        return f"{base}, {n}!" if n else f"{base}!"

    def rebuild_grid(self):
        self.greeting.set_text(self._greeting_text())
        self.greeting.set_visible(self.page_id == "favorites")
        while (c := self.flow.get_first_child()):
            self.flow.remove(c)
        self.cards, self.weather_cards = {}, []
        ws = self.layout.widgets_for(self.page_id)
        for w in ws:
            card = make_card(self.ha, w, self._card_action)
            if card is None:
                continue
            card.set_editing(self.editing)
            self.flow.append(card)
            if isinstance(card, WeatherCard):
                card.set_weather(self.weather_data)
                self.weather_cards.append(card)
            else:
                self.cards.setdefault(w["entityId"], []).append(card)
                st = self.ha.entities.get(w["entityId"])
                if st:
                    card.set_state(st)
                else:
                    card.title.set_text(w.get("customName") or w["entityId"])
                    card.subtitle.set_text("Aguardando dados…")
        self.stack.set_visible_child_name("grid" if ws else "empty")

    def refresh_scenes(self):
        for r in self.scene_rows:
            self.scene_group.remove(r)
        self.scene_rows = []
        scenes = sorted((s for e, s in self.ha.entities.items() if e.startswith("scene.")),
                        key=lambda s: s["attributes"].get("friendly_name", "").lower())
        for s in scenes:
            row = Adw.ActionRow(title=GLib.markup_escape_text(s["attributes"].get("friendly_name", s["entity_id"])),
                                subtitle=s["entity_id"])
            btn = Gtk.Button(label="Ativar", valign=Gtk.Align.CENTER)
            btn.add_css_class("suggested-action")
            btn.connect("clicked", lambda _b, e=s["entity_id"]: self.ha.call_service(
                "scene", "turn_on", {"entity_id": e}))
            row.add_suffix(btn)
            self.scene_group.add(row)
            self.scene_rows.append(row)
        self.stack.set_visible_child_name("scenes" if scenes else "scenes-empty")

    # ---------------------------------------------------------------- eventos
    def _on_state(self, _ha, eid, st):
        for card in self.cards.get(eid, []):
            card.set_state(st)
        if self.page_id == SCENES and eid.startswith("scene."):
            self.refresh_scenes()
        self._update_subtitle()

    def _on_status(self, _ha, status):
        show = status != "connected"
        self.banner.set_title(STATUS_TEXT.get(status, ""))
        self.banner.set_revealed(show)

    def _update_subtitle(self):
        if self.page_id == SCENES:
            n = sum(1 for e in self.ha.entities if e.startswith("scene."))
            self.win_title.set_subtitle(f"{n} cenários" if n != 1 else "1 cenário")
            return
        on = sum(1 for e, s in self.ha.entities.items()
                 if s["state"] == "on" or (e.startswith("climate.") and s["state"] not in ("off", "unavailable")))
        self.win_title.set_subtitle(f"{on} ligados" if on != 1 else "1 ligado")

    def refresh_weather(self):
        def done(w):
            if w:
                self.weather_data = w
            for c in self.weather_cards:
                c.set_weather(self.weather_data)
        weather.fetch(self.layout.data.get("city", ""), done)

    # ---------------------------------------------------------------- edição
    def _on_edit_toggled(self, btn):
        self.editing = btn.get_active()
        for cards in self.cards.values():
            for c in cards:
                c.set_editing(self.editing)
        for c in self.weather_cards:
            c.set_editing(self.editing)
        self.rebuild_sidebar()

    def _card_action(self, kind, wid):
        if kind == "remove":
            self.layout.remove_widget(wid)
        elif kind == "favorite":
            self.layout.toggle_favorite(wid)
        elif kind in ("prev", "next"):
            self.layout.move_widget(wid, self.page_id, -1 if kind == "prev" else 1)
        self.rebuild_grid()

    def add_device(self):
        existing = {w["entityId"] for w in self.layout.widgets_for(self.page_id)}
        AddDeviceDialog(self.ha.entities, existing, self._device_picked).present(self)
        if not self.ha.entities:
            self.toast.add_toast(Adw.Toast(title="Conecte ao Home Assistant para listar dispositivos"))

    def _device_picked(self, eid):
        if self.page_id == "favorites":
            room = self.layout.rooms[0]["id"] if self.layout.rooms else self.layout.add_room("Casa")
            self.layout.add_widget(eid, room, favorite=True)
        else:
            self.layout.add_widget(eid, self.page_id)
        self.rebuild_grid()

    def _room_added(self, name):
        rid = self.layout.add_room(name)
        self.rebuild_sidebar()
        self.show_page(rid)

    def _room_renamed(self, rid, name):
        self.layout.rename_room(rid, name)
        self.rebuild_sidebar()
        if self.page_id == rid:
            self.win_title.set_title(name)

    def _room_removed(self, rid):
        self.layout.remove_room(rid)
        if self.page_id == rid:
            self.page_id = "favorites"
        self.rebuild_sidebar()
        self.show_page(self.page_id)

    def layout_changed(self):
        self.rebuild_sidebar()
        self.show_page(self.page_id if self.page_id in
                       ("favorites", SCENES) or any(r["id"] == self.page_id for r in self.layout.rooms)
                       else "favorites")
        self.refresh_weather()
