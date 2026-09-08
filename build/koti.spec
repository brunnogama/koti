%define _build_id_links none
%define debug_package %{nil}
%define __strip /bin/true

Name:           koti
Version:        %{?pkg_version}%{!?pkg_version:1.0.9}
Release:        1%{?dist}
Summary:        Koti Smart Home Dashboard - One UI
License:        Proprietary
URL:            https://github.com/brunnogama/koti
AutoReqProv:    no
Requires:       gtk3, libnotify, nss, libXScrnSaver, libXtst, xdg-utils, at-spi2-core, libuuid

%description
Koti é um aplicativo para controle de casas inteligentes integrado ao Home Assistant com design fluido estilo Samsung One UI 9.

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}/opt/koti
mkdir -p %{buildroot}/usr/bin
mkdir -p %{buildroot}/usr/share/applications
mkdir -p %{buildroot}/usr/share/icons/hicolor/512x512/apps

cp -r %{_sourcedir}/dist-electron/linux-unpacked/* %{buildroot}/opt/koti/
chmod 755 %{buildroot}/opt/koti/koti
ln -sf /opt/koti/koti %{buildroot}/usr/bin/koti

cp %{_sourcedir}/build/icon.png %{buildroot}/usr/share/icons/hicolor/512x512/apps/koti.png
cp %{_sourcedir}/build/koti.desktop %{buildroot}/usr/share/applications/koti.desktop

%files
/opt/koti
/usr/bin/koti
/usr/share/applications/koti.desktop
/usr/share/icons/hicolor/512x512/apps/koti.png

%changelog
* Sun Sep 06 2026 Bruno Gama <bruno@koti.home> - 1.0.4-1
- Initial Fedora RPM release
