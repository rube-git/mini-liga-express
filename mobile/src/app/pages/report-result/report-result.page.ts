// src/app/pages/report-result/report-result.page.ts
import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { ApiService, ReportResultPayload } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report-result',
  templateUrl: './report-result.page.html',
  styleUrls: ['./report-result.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ReportResultPage implements OnInit {
  gameId: number = 0;
  form = {
    home_score: 0,
    away_score: 0
  };

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Obtener el ID del partido de la URL
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(this.gameId) || this.gameId <= 0) {
      console.error('ID de partido inválido');
      this.navCtrl.back();
    }
  }

  onSubmit() {
    const payload: ReportResultPayload = {
      home_score: this.form.home_score,
      away_score: this.form.away_score
    };

    this.api.reportResult(this.gameId, payload).subscribe({
      next: async (res) => {
        console.log('Resultado reportado:', res);
        const toast = await this.toastCtrl.create({
          message: 'Resultado reportado exitosamente.',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        // Regresar a la lista de partidos
        this.navCtrl.back();
      },
      error: async (err) => {
        console.error('Error al reportar resultado:', err);
        let message = 'Error al reportar resultado.';
        if (err.status === 400) {
          message = 'El resultado ya fue registrado previamente.';
        } else if (err.status === 404) {
          message = 'Partido no encontrado.';
        }
        const toast = await this.toastCtrl.create({
          message,
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}