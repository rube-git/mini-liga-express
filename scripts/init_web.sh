#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -d web/src ]; then
  echo "Angular ya parece estar inicializado en web/. Saliendo."
  exit 0
fi

APP_NAME="web"
API_URL_DEFAULT="http://127.0.0.1:8000"

if command -v ng >/dev/null 2>&1; then
  echo "Creando Angular con Angular CLI..."
  ng new $APP_NAME --directory=web --routing --style=scss --skip-git
else
  echo "No se encontró Angular CLI (ng). Crea el proyecto manualmente siguiendo web/README.md"
  mkdir -p web
fi

cd web
npm pkg set name="@miniliga/web" || true

# Añadir servicio API + dos componentes básicos
if [ -d src ]; then
  npx ng generate service services/api --skip-tests
  npx ng generate component features/teams --skip-tests
  npx ng generate component features/standings --skip-tests

  mkdir -p src/environments
  cat > src/environments/environment.ts <<ENV
export const environment = {
  production: false,
  API_URL: '$API_URL_DEFAULT'
};
ENV

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

  echo "Esqueleto Angular creado."
else
  echo "No se generó estructura Angular. Revisa web/README.md"
fi
