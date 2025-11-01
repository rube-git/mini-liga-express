#!/usr/bin/env bash
set -euo pipefail

# Requisitos: PHP >= 8.2, Composer, SQLite (o MySQL si adaptas)
# Si no tienes instalador de Laravel global, usaremos Composer create-project.

cd "$(dirname "$0")/.."

if [ -d backend/app ]; then
  echo "Laravel ya parece estar inicializado en backend/. Saliendo."
  exit 0
fi

echo "Creando proyecto Laravel en backend/ ..."
composer create-project laravel/laravel backend

cd backend

echo "Instalando dependencias útiles..."
composer require laravel/sanctum --no-interaction

echo "Configurando SQLite para rapidez..."
cp .env .env.example || true
cp .env.example .env
mkdir -p database
touch database/database.sqlite
php -r "file_put_contents('.env', preg_replace('/^DB_CONNECTION=.*/m','DB_CONNECTION=sqlite', file_get_contents('.env')));"
php -r "file_put_contents('.env', preg_replace('/^DB_DATABASE=.*/m,'DB_DATABASE=' . __DIR__ . '/database/database.sqlite', file_get_contents('.env')));"

echo "Creando migraciones y modelos..."
php artisan make:model Team -m
php artisan make:model Match -m
php artisan make:seeder TeamsAndMatchesSeeder
php artisan make:test StandingsTest

echo "Generando controlador API..."
php artisan make:controller Api/TeamController --api
php artisan make:controller Api/MatchController --api
php artisan make:controller Api/StandingsController

echo "Añadiendo rutas API..."
# Agrega marcador para insertar rutas si no existe
grep -q 'MINILIGA_ROUTES' routes/api.php || cat >> routes/api.php <<'PHP'

// === MINILIGA_ROUTES (auto) ===
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\StandingsController;

Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);
Route::post('/matches/{id}/result', [MatchController::class, 'result']);
Route::get('/standings', [StandingsController::class, 'index']);
// === /MINILIGA_ROUTES ===
PHP

echo "Escribe las migraciones según el README de backend/ y luego:"
echo "  php artisan migrate --seed"
echo "  php artisan serve"
