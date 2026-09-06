#!/bin/bash
set -e

echo "==> 1. Gerando build dos assets web (Vite) <=="
npm run build

echo "==> 2. Empacotando aplicação Electron <=="
npx electron-builder --config electron-builder.json --dir

echo "==> 3. Construindo pacote RPM nativo com rpmbuild <=="
mkdir -p rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS,tmp}

rpmbuild -bb \
  --define "_topdir $(pwd)/rpmbuild" \
  --define "_sourcedir $(pwd)" \
  --define "_tmppath $(pwd)/rpmbuild/tmp" \
  build/koti.spec

echo ""
echo "==> [SUCESSO] Pacote RPM construído com sucesso! <=="
ls -lh rpmbuild/RPMS/x86_64/*.rpm
