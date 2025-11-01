<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Team;
use App\Models\Game; 
use Illuminate\Database\Seeder;

class TeamsAndMatchesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Crear los equipos.
        $teams = collect(['Dragons', 'Sharks', 'Tigers', 'Wolves'])
            ->map(fn($name) => Team::create(['name' => $name]));

        // 2. Crear partidos (sin resultado) para la primera jornada.
        Game::create([
            'home_team_id' => $teams[0]->id, // Dragons vs Sharks
            'away_team_id' => $teams[1]->id
        ]);
        
        Game::create([
            'home_team_id' => $teams[2]->id, // Tigers vs Wolves
            'away_team_id' => $teams[3]->id
        ]);
        
        // 3. Opcional: Crear un partido con resultado para pruebas.
        Game::create([
            'home_team_id' => $teams[0]->id,
            'away_team_id' => $teams[3]->id,
            'home_score' => 2,
            'away_score' => 1,
            'played_at' => now(),
        ]);
        
        // 4. Opcional: Crear un partido con empate
        Game::create([
            'home_team_id' => $teams[1]->id,
            'away_team_id' => $teams[2]->id,
            'home_score' => 3,
            'away_score' => 3,
            'played_at' => now()->addDay(),
        ]);
    }
}
