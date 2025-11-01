// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <-- Importa map

// Interfaz para un equipo (ajusta según tu modelo Team)
export interface Team {
  id: number;
  name: string;
  // otros campos...
}

// Interfaz para un partido (Game)
export interface Game {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_score: number | null; // null si no se ha jugado
  away_score: number | null; // null si no se ha jugado
  played_at: string | null; // o Date, dependiendo de cómo lo manejes
  // Relaciones (si vienen en la respuesta)
  homeTeam?: Team; // Opcional, si la API lo devuelve
  awayTeam?: Team; // Opcional, si la API lo devuelve
  // otros campos...
}

// Interfaz para enviar el resultado
export interface ReportResultPayload {
  home_score: number;
  away_score: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.API_URL;

  constructor(private http: HttpClient) {}

  getPendingGames(): Observable<Game[]> {
    // Ahora puedes usar el endpoint real
    return this.http.get<Game[]>(`${this.base}/api/games?pending=true`);
  }

  reportResult(id: number, payload: ReportResultPayload) {
    return this.http.post(`${this.base}/api/games/${id}/result`, payload);
  }
}