import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { ConfiguracionTallerService } from '../services/configuracion-taller.service';
import { LicenciaService } from '../services/licencia.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatToolbarModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly configService = inject(ConfiguracionTallerService);
  readonly licenciaService = inject(LicenciaService);
  logoError = false;
  showTerminos = signal(false);

  ngOnInit(): void {
    this.configService.get().subscribe(() => { this.logoError = false; });
    this.licenciaService.checkStatus().subscribe();
  }

  logout(): void {
    this.auth.logout();
  }

  goToConfiguracion(): void {
    this.licenciaService.goToConfiguracion();
  }
}
