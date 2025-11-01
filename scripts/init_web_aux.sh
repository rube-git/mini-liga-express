#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

APP_NAME="web"
API_URL_DEFAULT="http://127.0.0.1:8000"

# --- 1. Verificación y Creación ---

if [ -d web/src ]; then
  echo "Angular ya parece estar inicializado en web/. Saliendo."
  exit 0
fi

# Intentar crear el proyecto con Angular CLI
if command -v ng >/dev/null 2>&1; then
  echo "Creando Angular con Angular CLI..."
  # Usamos --force por si la carpeta 'web' existe pero está vacía
  ng new $APP_NAME --directory=web --routing --style=scss --skip-git
  
  # Si la creación falla por cualquier razón, salir.
  if [ ! -d web/src ]; then
    echo "🚨 ERROR: ng new falló. Revisa la salida de la consola y tus dependencias de Node/npm."
    exit 1
  fi
  
else
  # Si ng no existe, informar y salir (no se puede continuar la automatización)
  echo "🚨 ERROR: No se encontró Angular CLI (comando 'ng')."
  echo "Por favor, instálalo globalmente con: npm install -g @angular/cli"
  echo "Una vez instalado, vuelve a ejecutar este script."
  exit 1
fi

# --- 2. Configuración y Generación de Archivos ---

cd web

echo "Ajustando package.json..."
# Este comando solo se ejecuta si el script llegó hasta aquí, asegurando que package.json existe.
npm pkg set name="@miniliga/web"

echo "Generando estructura básica (API Service y Componentes)..."
# Añadir servicio API + dos componentes básicos
npx ng generate service services/api --skip-tests
npx ng generate component features/teams --skip-tests
npx ng generate component features/standings --skip-tests

echo "Configurando entorno de API..."
mkdir -p src/environments
cat > src/environments/environment.ts <<ENV
export const environment = {
  production: false,
  API_URL: '$API_URL_DEFAULT'
};
ENV

echo "Configurando enrutador básico..."
# Router básico
cat > src/app/app-routing.module.ts <<'TS'
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsComponent } from './features/teams/teams.component';
import { StandingsComponent } from './features/standings/standings.component';

const routes: Routes = [
  { path: '', redirectTo: 'teams', pathMatch: 'full' },
  { path: 'teams', component: TeamsComponent },
  { path: 'standings', component: StandingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
TS

echo "================================================================"
echo "✅ Esqueleto Angular creado en la carpeta 'web/'."
echo "Próximo paso: Vuelve a la carpeta 'web' y ejecuta:"
echo "   npm start"
echo "================================================================"
