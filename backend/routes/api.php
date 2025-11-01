<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\StandingsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Las rutas de ejemplo predeterminadas de Laravel suelen ir aquí
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// === MINILIGA_ROUTES (auto) ===
Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);
Route::post('/games/{id}/result', [GameController::class, 'result']);
Route::get('/standings', [StandingsController::class, 'index']);
Route::get('/games', [GameController::class, 'index']); // <-- Añade esta línea
// === /MINILIGA_ROUTES ===
