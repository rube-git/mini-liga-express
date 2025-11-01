#!/usr/bin/env bash
set -euo pipefail

# Requisitos: PHP >= 8.2, Composer, SQLite (o MySQL si adaptas)

# Navega al directorio raíz del proyecto
cd "$(dirname "$0")/.."

# === 1. Verificación y Creación del Proyecto ===
if [ -d backend/app ]; then
  echo "Laravel ya parece estar inicializado en backend/. Saliendo."
  exit 0
fi

echo "Creando proyecto Laravel en backend/ ..."
composer create-project laravel/laravel backend

cd backend

echo "Instalando dependencias útiles (Sanctum)..."
composer require laravel/sanctum --no-interaction

# === 2. Configuración Robusta de SQLite (.env) ===
echo "Configurando SQLite para rapidez (robusto) y creando DB file..."
# Copia .env.example a .env
cp .env .env.example || true
cp .env.example .env

# Crea la carpeta y el archivo de la base de datos
mkdir -p database
touch database/database.sqlite

# 1. Reemplaza la conexión por 'sqlite'
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=sqlite/' .env
# 2. Reemplaza DB_DATABASE con la ruta relativa que funciona bien con Laravel
sed -i 's/^DB_DATABASE=.*/DB_DATABASE=database\/database.sqlite/' .env

echo "Generando Application Key (si faltaba)..."
php artisan key:generate --ansi

# === 3. Creación de Modelos, Migraciones y Controladores (Corregido 'Match') ===
echo "Creando migraciones y modelos (usando 'Game' en lugar de 'Match')..."
php artisan make:model Team -m
php artisan make:model Game -m
php artisan make:seeder TeamsAndMatchesSeeder
php artisan make:test StandingsTest

echo "Generando controladores API (usando 'GameController')..."
php artisan make:controller Api/TeamController --api
# El controlador MatchController ya no es necesario; usamos GameController.
php artisan make:controller Api/GameController --api
php artisan make:controller Api/StandingsController

# === 4. Añadiendo Rutas API (Corregidas para 'Game') ===
echo "Añadiendo rutas API (corregidas para /games/)..."
# Agrega marcador para insertar rutas si no existe
grep -q 'MINILIGA_ROUTES' routes/api.php || cat >> routes/api.php <<'PHP'

// === MINILIGA_ROUTES (auto) ===
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\StandingsController;

Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);
Route::post('/games/{id}/result', [GameController::class, 'result']);
Route::get('/standings', [StandingsController::class, 'index']);
// === /MINILIGA_ROUTES ===
PHP

echo " "
echo "================================================================"
echo "✅ Inicialización completa."
echo "Siguientes pasos:"
echo "1. **Define las columnas** para las tablas 'teams' y 'games' en los archivos de migración."
echo "2. Luego, ejecuta en la carpeta 'backend/':"
echo "   php artisan migrate --seed"
echo "   php artisan serve"
echo "================================================================"
