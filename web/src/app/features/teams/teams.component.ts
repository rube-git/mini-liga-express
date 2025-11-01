import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, TeamStandings } from '../../services/api.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="teams-container">
      <div class="header-section">
        <div class="header-content">
          <h2 class="title">
            <svg class="shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Gestión de Equipos
          </h2>
          <p class="subtitle">Administra los equipos de la liga</p>
        </div>
      </div>

      <div class="form-card">
        <div class="form-header">
          <svg class="form-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <h3 class="form-title">Añadir Nuevo Equipo</h3>
        </div>

        <form [formGroup]="teamForm" (ngSubmit)="onSubmit()" class="team-form">
          <div class="form-group">
            <label for="name" class="form-label">
              <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Nombre del Equipo
            </label>
            <div class="input-wrapper">
              <input 
                id="name" 
                type="text" 
                formControlName="name" 
                class="form-input"
                [class.input-error]="teamForm.get('name')?.invalid && (teamForm.get('name')?.dirty || teamForm.get('name')?.touched)"
                placeholder="Ej. Dragones Azules"
              >
              <button 
                type="submit" 
                [disabled]="teamForm.invalid || isSubmitting"
                class="submit-button"
              >
                <svg *ngIf="!isSubmitting" class="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <svg *ngIf="isSubmitting" class="button-icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ isSubmitting ? 'Guardando...' : 'Crear Equipo' }}
              </button>
            </div>
            <div *ngIf="teamForm.get('name')?.invalid && (teamForm.get('name')?.dirty || teamForm.get('name')?.touched)" class="error-message">
              <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              El nombre del equipo es obligatorio
            </div>
          </div>
        </form>
      </div>
      
      <div class="teams-section">
        <div class="section-header">
          <h3 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Equipos Registrados
          </h3>
          <span class="team-count">{{ teams.length }} {{ teams.length === 1 ? 'equipo' : 'equipos' }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-state">
          <svg class="loading-icon animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <p>Cargando equipos...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && teams.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <h4 class="empty-title">No hay equipos registrados</h4>
          <p class="empty-text">Comienza añadiendo tu primer equipo usando el formulario de arriba</p>
        </div>
        
        <!-- Teams Grid -->
        <div *ngIf="!isLoading && teams.length > 0" class="teams-grid">
          <div *ngFor="let team of teams; index as i" class="team-card">
            <div class="team-card-header">
              <div class="team-avatar">
                {{ team.name.charAt(0).toUpperCase() }}
              </div>
              <span class="team-number">#{{ i + 1 }}</span>
            </div>
            <div class="team-card-body">
              <h4 class="team-card-name">{{ team.name }}</h4>
              <div class="team-card-meta">
                <span class="team-id">ID: {{ team.id }}</span>
              </div>
            </div>
            <div class="team-card-footer">
              <button class="action-button view">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  teamForm: FormGroup;
  teams: TeamStandings[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    console.log('TeamsComponent initialized');
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    console.log('Loading teams...');
    
    this.apiService.getTeams().subscribe({
      next: (data) => {
        console.log('Teams loaded:', data);
        this.teams = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (err) => {
        console.error('Error al cargar equipos:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Submitting team:', this.teamForm.value);
      
      this.apiService.createTeam(this.teamForm.value).subscribe({
        next: (newTeam) => {
          console.log('Team created:', newTeam);
          this.teamForm.reset();
          this.isSubmitting = false;
          this.loadTeams(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al crear equipo:', err);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}