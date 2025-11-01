<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    /**
     * Devuelve todos los equipos.
     */
    public function index()
    {
        // Esto devuelve la lista de equipos, usado por el frontend de Angular.
        return Team::all();
    }

    /**
     * Crea un nuevo equipo (utilizado por el formulario de TeamsComponent en Angular).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Asegura que el nombre sea obligatorio, una cadena y que no exceda 255 caracteres.
            // Rule::unique('teams', 'name') asegura que no se puedan crear equipos con nombres duplicados.
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('teams', 'name')
            ],
        ]);

        $team = Team::create($validated);

        // Respuesta 201 Created para indicar que el recurso se creó con éxito.
        return response()->json($team, 201); 
    }
}
