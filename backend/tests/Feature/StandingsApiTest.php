<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
// No necesitas importar las factories si no las usas
use App\Models\Team;
use App\Models\Game;

class StandingsApiTest extends TestCase
{
    use RefreshDatabase; // Asegura base de datos limpia por test

    public function test_get_standings_returns_correct_structure_and_data()
    {
        // 1. Preparar los datos: Crea algunos equipos *directamente*
        $teamA = Team::create(['name' => 'Dragones Negros']);
        $teamB = Team::create(['name' => 'Águilas Reales']);
        $teamC = Team::create(['name' => 'Tigres del Norte']);

        // 2. Preparar los datos: Crea algunos partidos con resultados *directamente*
        // Partido 1: Dragones Negros (2) - (1) Águilas Reales -> Gana Dragones Negros
        Game::create([
            'home_team_id' => $teamA->id,
            'away_team_id' => $teamB->id,
            'home_score' => 2,
            'away_score' => 1,
            'played_at' => now(), // Indica que el partido ya se jugó
        ]);

        // Partido 2: Tigres del Norte (0) - (0) Dragones Negros -> Empate
        Game::create([
            'home_team_id' => $teamC->id,
            'away_team_id' => $teamA->id,
            'home_score' => 0,
            'away_score' => 0,
            'played_at' => now(), // Indica que el partido ya se jugó
        ]);

        // Partido 3: Águilas Reales (3) - (3) Tigres del Norte -> Empate
        Game::create([
            'home_team_id' => $teamB->id,
            'away_team_id' => $teamC->id,
            'home_score' => 3,
            'away_score' => 3,
            'played_at' => now(), // Indica que el partido ya se jugó
        ]);

        // 3. Hacer la petición HTTP GET al endpoint
        $response = $this->getJson('/api/standings');

        // 4. Afirmaciones (Asserts)
        // A. Verifica que el código de estado HTTP sea 200 (éxito)
        $response->assertStatus(200);

        // B. Verifica que la respuesta sea JSON
        $response->assertHeader('Content-Type', 'application/json');

        // C. Verifica que la estructura del JSON sea correcta
        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'played',
                'won',
                'drawn',
                'lost',
                'goals_for',
                'goals_against',
                'goal_diff',
                'points',
            ]
        ]);

        // D. Verifica que los datos específicos estén presentes y sean correctos según los partidos creados
        // Calculamos manualmente los puntos esperados:
        // - Dragones Negros: 1 victoria (3 pts), 1 empate (1 pt) = 4 pts, 2 partidos jugados
        // - Águilas Reales: 0 victorias, 1 empate (1 pt), 1 derrota = 1 pt, 2 partidos jugados
        // - Tigres del Norte: 0 victorias, 2 empates (2 pts), 0 derrotas = 2 pts, 2 partidos jugados
        $response->assertJson([
            [
                'name' => 'Dragones Negros',
                'points' => 4,
                'played' => 2,
            ],
            [
                'name' => 'Tigres del Norte',
                'points' => 2,
                'played' => 2,
            ],
            [
                'name' => 'Águilas Reales',
                'points' => 1,
                'played' => 2,
            ],
        ], $strict = false);
    }
}