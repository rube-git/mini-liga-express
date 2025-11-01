<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GameController extends Controller
{
    public function index(Request $request)
    {
         $query = Game::with(['homeTeam', 'awayTeam']);

        // Filtrar por partidos pendientes si se solicita
        if ($request->has('pending') || $request->has('played') && $request->boolean('played') === false) {
            $query->whereNull('home_score')->whereNull('away_score');
        }

        return $query->get();
    }
    /**
     * Registra el resultado de un partido y actualiza las estadísticas de los equipos (Goles A Favor y Goles En Contra).
     * @param int $id ID del partido (game)
     */
    public function result(Request $request, $id)
    {
        // 1. Validar la entrada: scores deben ser enteros no negativos.
        $validated = $request->validate([
            'home_score' => 'required|integer|min:0',
            'away_score' => 'required|integer|min:0',
        ]);

        // 2. Encontrar el partido
        $game = Game::find($id);

        if (!$game) {
            return response()->json(['message' => 'Partido no encontrado'], 404);
        }

        // 3. Revisar si el resultado ya fue registrado (solo permitimos un registro por partido)
        if (!is_null($game->home_score) || !is_null($game->away_score)) {
            return response()->json(['message' => 'El resultado para este partido ya ha sido registrado previamente.'], 400);
        }
        
        // 4. Obtener los modelos de los equipos
        $homeTeam = $game->homeTeam;
        $awayTeam = $game->awayTeam;

        // 5. Iniciar Transacción de Base de Datos
        DB::beginTransaction();

        try {
            // A. Actualizar el partido con el resultado y fecha/hora de juego
            $game->home_score = $validated['home_score'];
            $game->away_score = $validated['away_score'];
            $game->played_at = now(); 
            $game->save();

            // B. Actualizar estadísticas del Equipo Local
            $homeTeam->goals_for += $game->home_score;
            $homeTeam->goals_against += $game->away_score;
            $homeTeam->save();

            // C. Actualizar estadísticas del Equipo Visitante
            $awayTeam->goals_for += $game->away_score;
            $awayTeam->goals_against += $game->home_score;
            $awayTeam->save();

            DB::commit(); // Confirmar todas las operaciones

            return response()->json([
                'message' => 'Resultado registrado y estadísticas de goles actualizadas con éxito.',
                'game' => $game->load('homeTeam', 'awayTeam')
            ]);

        } catch (\Exception $e) {
            DB::rollBack(); // Deshacer si algo falla
            Log::error('Error al registrar resultado del partido: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar los resultados.'], 500);
        }
    }
}
