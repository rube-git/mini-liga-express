<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
     

        // Crear un usuario de prueba por defecto
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // === LÓGICA DE LA LIGA ===
        // Llamar al seeder específico de equipos y partidos
        $this->call([
            TeamsAndMatchesSeeder::class,
        ]);
    }
}
