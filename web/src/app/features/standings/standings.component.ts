import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, TeamStandings } from '../../services/api.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="standings-container">
      <div class="header-section">
        <div class="header-content">
          <h2 class="title">
            <svg class="trophy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
            Tabla de Clasificación
          </h2>
          <p class="subtitle">Temporada 2024-2025</p>
        </div>
      
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <svg class="loading-icon spinning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        <p>Cargando clasificación...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && standings.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="empty-title">No hay datos disponibles</h3>
        <p class="empty-text">Asegúrate de que los partidos tengan resultados registrados.</p>
      </div>

      <!-- Standings Table -->
      <div *ngIf="!isLoading && standings.length > 0" class="table-wrapper">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-pos">Pos</th>
              <th class="col-team">Equipo</th>
              <th class="col-stat">PJ</th>
              <th class="col-stat">GF</th>
              <th class="col-stat">GC</th>
              <th class="col-stat">Dif</th>
              <th class="col-points">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let team of standings; index as i" 
                [class.top-team]="i < 4"
                [class.position-1]="i === 0"
                [class.position-2]="i === 1"
                [class.position-3]="i === 2"
                [class.position-4]="i === 3">
              <td class="col-pos">
                <span class="position-badge" [class.champion]="i === 0">{{ i + 1 }}</span>
              </td>
              <td class="col-team">
                <div class="team-info">
                  <div class="team-avatar">{{ team.name.charAt(0) }}</div>
                  <span class="team-name">{{ team.name }}</span>
                </div>
              </td>
              <td class="col-stat">{{ team.played }}</td>
              <td class="col-stat stat-positive">{{ team.goals_for }}</td>
              <td class="col-stat stat-negative">{{ team.goals_against }}</td>
              <td class="col-stat" [class.stat-positive]="team.goal_diff > 0" [class.stat-negative]="team.goal_diff < 0">
                {{ team.goal_diff > 0 ? '+' : '' }}{{ team.goal_diff }}
              </td>
              <td class="col-points">
                <span class="points-badge">{{ team.points }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoading && standings.length > 0" class="legend">
        <div class="legend-item">
          <span class="legend-dot position-1-dot"></span>
          <span>Campeón</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot position-2-dot"></span>
          <span>Clasificación directa</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./standings.component.scss']
})
export class StandingsComponent implements OnInit, OnDestroy {
  standings: TeamStandings[] = [];
  isLoading = false;
  private visibilityListener?: () => void;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef // 👈 ¡CLAVE! Inyectar ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 StandingsComponent initialized at:', new Date().toISOString());
    this.loadStandings();
    
    // 👇 Listener para recargar cuando vuelves a la pestaña
    this.visibilityListener = () => {
      if (!document.hidden) {
        console.log('📱 Página visible, recargando...');
        this.loadStandings();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityListener);
    }
  }

  ngOnDestroy(): void {
    // 👇 Limpiar el listener
    if (this.visibilityListener && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
  }

  loadStandings(): void {
    // Prevenir múltiples llamadas simultáneas
    if (this.isLoading) {
      console.log('⏳ Ya hay una carga en progreso...');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // 👈 Forzar detección de cambios
    console.log('📊 Loading standings at:', new Date().toISOString());
    
    this.apiService.getStandings().subscribe({
      next: (data) => {
        console.log('✅ Standings loaded:', data.length, 'teams');
        console.log('Data:', data);
        
        this.standings = [...data]; // 👈 Crear nueva referencia del array
        this.isLoading = false;
        
        this.cdr.detectChanges(); // 👈 ¡MUY IMPORTANTE! Forzar detección de cambios
        
        console.log('Component standings:', this.standings.length);
      },
      error: (err) => {
        console.error('❌ Error loading standings:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          url: err.url
        });
        this.isLoading = false;
        this.cdr.detectChanges(); // 👈 También en el error
      }
    });
  }
}