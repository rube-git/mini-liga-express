// src/app/pages/games/games.page.ts
import { Component } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { ApiService, Game } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.page.html',
  styleUrls: ['./games.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class GamesPage {
  games: Game[] = [];
  loading = true;

  constructor(private api: ApiService, private navCtrl: NavController) {}

  // Este método se llama cada vez que la página entra en la vista
  ionViewDidEnter() {
    this.loadGames();
  }

  loadGames() {
    this.loading = true;
    this.api.getPendingGames().subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
        console.log('Partidos pendientes (games):', data);
      },
      error: (err) => {
        console.error('Error al cargar partidos:', err);
        this.loading = false;
        // Opcional: Mostrar un toast o alerta
      }
    });
  }

  // Método para navegar a la página de reportar resultado
  reportResult(gameId: number) {
    this.navCtrl.navigateForward(['/report-result', gameId]);
  }
}