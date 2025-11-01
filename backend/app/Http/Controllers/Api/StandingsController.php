<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Team;
use Illuminate\Http\Request;

class StandingsController extends Controller
{
    /**
     * Calcula y devuelve la tabla de clasificación.
     */
    public function index()
    {
        // 1. Obtener todos los equipos y todos los partidos que tienen un resultado registrado
        $teams = Team::all();
        $playedGames = Game::whereNotNull('home_score')
                            ->whereNotNull('away_score')
                            ->get();

        // 2. Inicializar la estructura de clasificación
        // Usamos mapWithKeys para inicializar la clasificación indexada por team_id
        $standings = $teams->mapWithKeys(function ($team) {
            return [$team->id => [
                'id' => $team->id,
                'name' => $team->name,
                'goals_for' => $team->goals_for, 
                'goals_against' => $team->goals_against, 
                'played' => 0,
                'won' => 0,
                'drawn' => 0,
                'lost' => 0,
                'points' => 0,
                'goal_diff' => $team->goals_for - $team->goals_against,
            ]];
        })->toArray(); 

        // 3. Procesar todos los partidos jugados para calcular W/D/L y Puntos
        foreach ($playedGames as $game) {
            $homeId = $game->home_team_id;
            $awayId = $game->away_team_id;
            $homeScore = $game->home_score;
            $awayScore = $game->away_score;

            // Asegurar que ambos equipos existen en los standings (siempre deben existir)
            if (!isset($standings[$homeId]) || !isset($standings[$awayId])) {
                continue; 
            }

            // A. Incrementar Partidos Jugados (Played)
            $standings[$homeId]['played']++;
            $standings[$awayId]['played']++;

            // B. Calcular Puntos, Victorias, Empates, Derrotas
            if ($homeScore > $awayScore) {
                // Victoria Local
                $standings[$homeId]['won']++;
                $standings[$homeId]['points'] += 3;
                $standings[$awayId]['lost']++;

            } elseif ($homeScore < $awayScore) {
                // Victoria Visitante
                $standings[$awayId]['won']++;
                $standings[$awayId]['points'] += 3;
                $standings[$homeId]['lost']++;

            } else {
                // Empate
                $standings[$homeId]['drawn']++;
                $standings[$homeId]['points'] += 1;
                $standings[$awayId]['drawn']++;
                $standings[$awayId]['points'] += 1;
            }
        }

        // 4. Convertir el array de standings de vuelta a una colección y ordenar
        $finalStandings = collect($standings)
            ->sortByDesc('points')      // 1. Criterio: Puntos (mayor a menor)
            ->sortByDesc('goal_diff')   // 2. Criterio: Diferencia de Goles (mayor a menor)
            ->sortByDesc('goals_for')   // 3. Criterio: Goles a Favor (mayor a menor)
            ->values(); // Resetear las claves del array para que sea una lista estándar

        // 5. Devolver la clasificación final
        return response()->json($finalStandings);
    }
}
