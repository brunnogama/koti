%global app_id io.github.brunnogama.Koti

Name:           koti
Version:        %{?pkg_version}%{!?pkg_version:2.0.0}
Release:        1%{?dist}
Summary:        Painel de casa inteligente para o Home Assistant (GTK4/libadwaita)
License:        Proprietary
URL:            https://github.com/brunnogama/koti
BuildArch:      noarch

BuildRequires:  desktop-file-utils
Requires:       python3
Requires:       python3-gobject
Requires:       gtk4 >= 4.14
Requires:       libadwaita >= 1.5
Requires:       libsoup3
Requires:       hicolor-icon-theme

%description
Koti é um aplicativo nativo GNOME (GTK4 + libadwaita) para controlar a casa
inteligente pelo Home Assistant: luzes, interruptores, sensores, climatização,
cenários e clima, organizados por cômodos.

%prep

%build

%install
install -d %{buildroot}%{_datadir}/koti/koti
install -m 644 %{_sourcedir}/desktop/koti/*.py %{buildroot}%{_datadir}/koti/koti/
install -Dm 755 %{_sourcedir}/desktop/data/koti %{buildroot}%{_bindir}/koti
install -Dm 644 %{_sourcedir}/desktop/data/%{app_id}.desktop \
    %{buildroot}%{_datadir}/applications/%{app_id}.desktop
install -Dm 644 %{_sourcedir}/build/icon.png \
    %{buildroot}%{_datadir}/icons/hicolor/512x512/apps/%{app_id}.png

%check
desktop-file-validate %{buildroot}%{_datadir}/applications/%{app_id}.desktop

%files
%{_bindir}/koti
%{_datadir}/koti/
%{_datadir}/applications/%{app_id}.desktop
%{_datadir}/icons/hicolor/512x512/apps/%{app_id}.png

%changelog
* Mon Nov 09 2026 Bruno Gama <bruno@koti.home> - 2.0.0-1
- Reescrita do desktop em GTK4 + libadwaita (substitui a versão Electron)
