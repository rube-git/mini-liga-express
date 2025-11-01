#!/usr/bin/env bash
# init_mobile.sh - Script para inicializar el proyecto móvil de MiniLiga con Ionic y Angular
# Uso: ./scripts/init_mobile.sh [opcional: URL_BACKEND]

set -euo pipefail # Salir inmediatamente si un comando falla, detectar variables no definidas, pipe failure

# --- Configuración ---
readonly SCRIPT_DIR="$(dirname "$0")"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly MOBILE_DIR="$PROJECT_ROOT/mobile"
readonly API_URL_DEFAULT="http://127.0.0.1:8000"

# --- Funciones de ayuda ---
log_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1" # Azul
}

log_warn() {
  echo -e "\033[1;33m[WARN]\033[0m $1" # Amarillo
}

log_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1" # Rojo
}

cleanup() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    log_error "El script falló con código de salida $exit_code."
    # Opcional: revertir cambios si es necesario
    # rm -rf "$MOBILE_DIR"
  fi
  exit $exit_code
}

# --- Verificaciones iniciales ---
check_prerequisites() {
  log_info "Verificando prerequisitos..."

  if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado. Por favor, instálalo e inténtalo de nuevo."
    exit 1
  fi

  # Verificar si Ionic CLI está instalado globalmente
  if ! command -v ionic &> /dev/null; then
    log_warn "Ionic CLI no encontrado. Se instalará localmente en el proyecto."
    # npm install -g @ionic/cli # Descomentar si se prefiere instalación global
    # Usaremos npx para ejecutar Ionic localmente
  else
    log_info "Ionic CLI encontrado."
  fi
}

# --- Generación de archivos ---
create_environment_file() {
  log_info "Creando archivo de entorno..."
  local api_url="${1:-$API_URL_DEFAULT}"
  mkdir -p "$MOBILE_DIR/src/environments"

  cat > "$MOBILE_DIR/src/environments/environment.ts" << ENV_EOF
export const environment = {
  production: false,
  API_URL: '$api_url'
};
ENV_EOF
  log_info "Archivo de entorno creado en $MOBILE_DIR/src/environments/environment.ts"
}

create_api_service() {
  log_info "Creando servicio API..."
  # Usamos npx ng para asegurar que se use el CLI local del proyecto
  npx ng generate service services/api --project mobile --skip-tests --dry-run=false 2>/dev/null || {
    log_warn "No se pudo usar Angular CLI para generar el servicio. Creando manualmente."
    mkdir -p "$MOBILE_DIR/src/app/services"
    cat > "$MOBILE_DIR/src/app/services/api.service.ts" << SERVICE_EOF
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  played: boolean;
  home_score?: number;
  away_score?: number;
}

export interface ReportResultPayload {
  home_score: number;
  away_score: number;
}

@Injectable({
  providedIn: 'root' // Esto es crucial para evitar NG0201
})
export class ApiService {
  private readonly base = environment.API_URL;

  constructor(private http: HttpClient) {}

  getPendingMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(\`\${this.base}/api/matches?played=false\`);
  }

  reportResult(id: number, payload: ReportResultPayload): Observable<any> {
    return this.http.post(\`\${this.base}/api/matches/\${id}/result\`, payload);
  }
}
SERVICE_EOF
  }
  log_info "Servicio API generado."
}

create_pages() {
  log_info "Creando páginas..."
  # Usamos npx ng para asegurar que se use el CLI local del proyecto
  npx ng generate page pages/matches --project mobile --skip-tests --dry-run=false 2>/dev/null || {
    log_warn "No se pudo usar Angular CLI para generar la página matches. Creando estructura básica manualmente."
    mkdir -p "$MOBILE_DIR/src/app/pages/matches"
    touch "$MOBILE_DIR/src/app/pages/matches/matches.page.ts"
    touch "$MOBILE_DIR/src/app/pages/matches/matches.page.html"
    touch "$MOBILE_DIR/src/app/pages/matches/matches.page.scss"
  }

  npx ng generate page pages/report-result --project mobile --skip-tests --dry-run=false 2>/dev/null || {
    log_warn "No se pudo usar Angular CLI para generar la página report-result. Creando estructura básica manualmente."
    mkdir -p "$MOBILE_DIR/src/app/pages/report-result"
    touch "$MOBILE_DIR/src/app/pages/report-result/report-result.page.ts"
    touch "$MOBILE_DIR/src/app/pages/report-result/report-result.page.html"
    touch "$MOBILE_DIR/src/app/pages/report-result/report-result.page.scss"
  }
  log_info "Páginas generadas."
}

# --- Punto de entrada ---
main() {
  trap cleanup EXIT # Ejecutar 'cleanup' al salir del script

  local backend_url="${1:-$API_URL_DEFAULT}"

  log_info "Iniciando inicialización del proyecto móvil en: $MOBILE_DIR"
  log_info "URL del backend: $backend_url"

  if [ -d "$MOBILE_DIR" ] && [ -f "$MOBILE_DIR/angular.json" ]; then
    log_warn "Parece que el proyecto móvil ya existe en $MOBILE_DIR. Se omitirá la creación del proyecto base."
  else
    if command -v ionic &> /dev/null; then
      log_info "Creando proyecto Ionic con Ionic CLI..."
      ionic start mobile tabs --type=angular --no-git --capacitor --package-id=com.miniliga.app --confirm --directory "$MOBILE_DIR"
    else
      log_error "No se puede crear el proyecto base: Ionic CLI no está instalado y no se encontró un proyecto existente."
      log_info "Por favor, instala Ionic CLI o crea el proyecto manualmente en $MOBILE_DIR siguiendo la documentación de Ionic."
      exit 1
    fi
  fi

  check_prerequisites

  cd "$MOBILE_DIR"

  create_environment_file "$backend_url"
  create_api_service
  create_pages

  log_info "Inicialización del proyecto móvil completada en $MOBILE_DIR."
  log_info "Recuerda:"
  log_info "1. Verificar las rutas en src/app/app-routing.module.ts o src/app/app.routes.ts"
  log_info "2. Asegurarte de que HttpClientModule esté importado en tu App Module o App Config."
  log_info "3. Implementar la lógica de las páginas generadas."
  log_info "4. Correr 'npm install' dentro de $MOBILE_DIR si es necesario."
  log_info "5. Ejecutar 'npm start' para iniciar la aplicación."
}

# Ejecutar la función principal con los argumentos pasados al script
main "$@"