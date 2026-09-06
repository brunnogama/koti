#!/bin/bash
# Script de automação para compilação do APK Universal do Koti

set -e

echo "=========================================="
echo "      KOTI — Compilador de APK Universal   "
echo " (Compatível: Celular, Tablet e Android TV)"
echo "=========================================="

echo "[1/3] Compilando assets do projeto web..."
npm run build

echo "[2/3] Sincronizando com o projeto nativo Android..."
npx cap sync android

echo "[3/3] Compilando APK via Gradle..."
if command -v java &> /dev/null; then
    cd android
    ./gradlew assembleDebug
    echo "=========================================="
    echo "✔ APK gerado com sucesso em:"
    echo "  android/app/build/outputs/apk/debug/app-debug.apk"
    echo "=========================================="
else
    echo "------------------------------------------"
    echo "Java/Android SDK não encontrado no PATH do terminal."
    echo "Para gerar o APK agora:"
    echo "1. Abra o projeto no Android Studio rodando:"
    echo "   npx cap open android"
    echo "2. Clique em: Build > Build APK(s)"
    echo "------------------------------------------"
fi
