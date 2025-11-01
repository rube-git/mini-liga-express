import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Asegúrate de que este path sea correcto para tu entorno
import { environment } from '../../environments/environment'; 
import { Observable } from 'rxjs';

// Interfaz para la clasificación (standings) que el backend debe devolver
export interface TeamStandings {
  id: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

// Interfaz para la creación de equipos
export interface TeamCreatePayload {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.API_URL;

  // Se necesita importar HttpClientModule en app.module.ts para que esto funcione
  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los equipos.
   */
  getTeams(): Observable<TeamStandings[]> {
    // Usamos TeamStandings[] como tipo de retorno temporal, ya que el team model es la base.
    return this.http.get<TeamStandings[]>(`${this.base}/api/teams`);
  }

  /**
   * Crea un nuevo equipo.
   */
  createTeam(payload: TeamCreatePayload): Observable<any> {
    return this.http.post(`${this.base}/api/teams`, payload);
  }

  /**
   * Obtiene la tabla de clasificación ordenada.
   */
  getStandings(): Observable<TeamStandings[]> {
    return this.http.get<TeamStandings[]>(`${this.base}/api/standings`);
  }
}
