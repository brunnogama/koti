#!/bin/bash
# Gera o RPM do Koti desktop (GTK4/libadwaita). O app Android continua usando build-apk.sh.
set -e
cd "$(dirname "$0")"

VERSION="${1:-$(python3 -c "import re;print(re.search(r'\"(.+)\"',open('desktop/koti/__init__.py').read()).group(1))")}"
echo "==> Versão de empacotamento: $VERSION <=="

python3 -m py_compile desktop/koti/*.py
find desktop -name __pycache__ -prune -exec rm -rf {} +

mkdir -p rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS,tmp}
rpmbuild -bb \
  --define "_topdir $(pwd)/rpmbuild" \
  --define "_sourcedir $(pwd)" \
  --define "_tmppath $(pwd)/rpmbuild/tmp" \
  --define "pkg_version $VERSION" \
  build/koti.spec

echo ""
echo "==> [SUCESSO] Pacote RPM construído com sucesso! <=="
ls -lh rpmbuild/RPMS/noarch/*.rpm
