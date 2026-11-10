import sys

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
from gi.repository import Adw, Gdk, Gio, Gtk  # noqa: E402

from . import APP_ID, __version__, store  # noqa: E402
from .dialogs import PreferencesDialog  # noqa: E402
from .ha import HAClient  # noqa: E402
from .window import KotiWindow  # noqa: E402

CSS = """
.koti-card { padding: 14px 16px; }
.koti-icon {
  background: alpha(@accent_bg_color, 0.18);
  color: @accent_color;
  border-radius: 99px;
  padding: 10px;
}
.koti-icon.off { background: alpha(currentColor, 0.08); color: @window_fg_color; opacity: 0.7; }
"""


class KotiApp(Adw.Application):
    def __init__(self):
        super().__init__(application_id=APP_ID, flags=Gio.ApplicationFlags.DEFAULT_FLAGS)
        self.ha = HAClient()
        self.layout = store.Layout()
        self.cfg = store.load_config()
        self.win = None
        for name, cb, accel in (("preferences", lambda *_: self.open_prefs(), "<Primary>comma"),
                                ("about", lambda *_: self.about(), None),
                                ("quit", lambda *_: self.quit(), "<Primary>q")):
            a = Gio.SimpleAction.new(name, None)
            a.connect("activate", cb)
            self.add_action(a)
            if accel:
                self.set_accels_for_action(f"app.{name}", [accel])

    def do_startup(self):
        Adw.Application.do_startup(self)
        css = Gtk.CssProvider()
        css.load_from_string(CSS)
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(), css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

    def do_activate(self):
        if not self.win:
            self.win = KotiWindow(self, self.ha, self.layout, self.open_prefs)
            self.ha.connect_to(self.cfg)
            if not self.cfg.get("host") and not self.cfg.get("demo"):
                self.open_prefs()
        self.win.present()

    def open_prefs(self):
        PreferencesDialog(self.cfg, self.layout, self._save_connection, self._save_profile,
                          self._reset_layout).present(self.win)

    def _save_connection(self, new):
        if new != {k: self.cfg.get(k) for k in new}:
            self.cfg = {**self.cfg, **new}
            store.save_config(self.cfg)
            self.ha.connect_to(self.cfg)
            self.win.rebuild_grid()

    def _save_profile(self, name, city):
        if name != self.layout.data.get("userName") or city != self.layout.data.get("city"):
            self.layout.data["userName"], self.layout.data["city"] = name, city
            self.layout.save()
            self.win.layout_changed()

    def _reset_layout(self):
        self.layout.reset()
        self.win.layout_changed()

    def about(self):
        Adw.AboutDialog(application_name="Koti", application_icon=APP_ID, version=__version__,
                        developer_name="Bruno Gama", comments="Painel de casa inteligente para o Home Assistant",
                        website="https://github.com/brunnogama/koti",
                        license_type=Gtk.License.UNKNOWN).present(self.win)


def main(argv=None):
    return KotiApp().run(argv or sys.argv)
