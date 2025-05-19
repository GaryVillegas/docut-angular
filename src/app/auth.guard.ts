import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, combineLatest } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
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

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.auth.authState.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          console.log('access denied');
          this.router.navigate(['/login']);
          return [false];
        }

        // Verificar si el usuario tiene información en Firestore
        return this.storeService.getUserData(user.uid).pipe(
          map((userData) => {
            const hasUserInfo =
              userData.userInfoData.name !== '' &&
              userData.userInfoData.lastName !== '' &&
              userData.userInfoData.rut !== '';

            if (!hasUserInfo) {
              this.router.navigate(['/user-info']);
              return false;
            } else {
              return true;
            }
          })
        );
      })
    );
  }
}
