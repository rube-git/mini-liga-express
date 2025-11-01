// src/app/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // RouterModule para routerLink
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Puedes agregar lógica aquí si necesitas manejar estado o eventos del sidebar
  constructor(private router: Router) {} // Opcional: si necesitas navegar programáticamente

  // Opcional: Método para navegar programáticamente
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}