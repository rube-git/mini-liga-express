#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -d mobile/src ]; then
  echo "Ionic ya parece estar inicializado en mobile/. Saliendo."
  exit 0
fi

API_URL_DEFAULT="http://127.0.0.1:8000"

if command -v ionic >/dev/null 2>&1; then
  echo "Creando Ionic con Ionic CLI..."
  ionic start mobile tabs --type=angular --no-git --capacitor --package-id=com.miniliga.app --confirm
else
  echo "No se encontró Ionic CLI. Crea el proyecto manualmente siguiendo mobile/README.md"
  mkdir -p mobile
fi

cd mobile || exit 0

# Config de entorno
mkdir -p src/environments
cat > src/environments/environment.ts <<ENV
export const environment = {
  production: false,
  API_URL: '$API_URL_DEFAULT'
};
ENV

# Página sencilla para matches y report-result
if [ -d src/app ]; then
  npx ng g page pages/matches --skip-tests
  npx ng g page pages/report-result --skip-tests
  npx ng g service services/api --skip-tests || true
  echo "Esqueleto Ionic creado."
fi
