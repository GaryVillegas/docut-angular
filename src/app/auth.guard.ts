import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private storeService: StoreService
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = await this.auth.currentUser;

    if (!user) {
      console.log('🚫 Acceso denegado: usuario no autenticado');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const userData = await this.storeService.getUserData(user.uid);

      if (
        !userData ||
        !userData.userInfo.name ||
        !userData.userInfo.lastName ||
        !userData.userInfo.rut
      ) {
        console.log('⚠️ Información de usuario incompleta');
        this.router.navigate(['/user-info']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error al obtener datos del usuario:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
