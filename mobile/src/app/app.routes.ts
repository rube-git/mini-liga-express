// src/app/app.routes.ts (o app-routing.module.ts si usas NgModules)
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'games', // Cambiado de 'matches' a 'games'
    loadComponent: () => import('./pages/games/games.page').then( m => m.GamesPage)
  },
  {
    path: 'report-result/:id',
    loadComponent: () => import('./pages/report-result/report-result.page').then( m => m.ReportResultPage)
  },
  {
    path: '',
    redirectTo: '/games', // Redirige a 'games'
    pathMatch: 'full'
  },
  // ... otras rutas
];