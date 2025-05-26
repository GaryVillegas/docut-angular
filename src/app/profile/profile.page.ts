import { Component, type OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, finalize, catchError } from 'rxjs/operators';
import type { UserStoreData } from '../types/store';
import type { UserData } from '../types/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userData: UserData = {
    UID: '',
    userInfoData: {
      name: '',
      lastName: '',
      rut: '',
      tipe: '',
    },
  };

  userStoreData: UserStoreData = {
    userUID: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
  };

  isClient = true;
  setDinamicClass = '';

  // 🔄 Estado de loading
  isLoading = false;
  loadingError: string | null = null;

  constructor(
    private authService: AuthService,
    private route: Router,
    private storeServ: StoreService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  onLogOut() {
    this.authService.logOut();
    this.route.navigate(['/']);
  }

  /**
   * 🚀 Función optimizada para cargar el perfil del usuario
   * Usa forkJoin para hacer llamadas paralelas cuando es posible
   */
  loadUserProfile() {
    this.isLoading = true;
    this.loadingError = null;

    this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          if (!user?.uid) {
            throw new Error('Usuario no autenticado');
          }

          // 📊 Cargar datos del usuario primero
          return this.storeServ.getUserData(user.uid).pipe(
            switchMap((userData) => {
              this.userData = userData;
              this.isClient = userData.userInfoData.tipe === 'cliente';

              console.log('✅ Datos de usuario cargados:', userData);

              // 🏪 Si es cliente, cargar datos de tienda en paralelo
              if (this.isClient) {
                return this.storeServ.getStoreData(user.uid).pipe(
                  catchError((error) => {
                    console.warn('⚠️ Error cargando tienda:', error);
                    return of(this.userStoreData); // Devolver datos vacíos si hay error
                  })
                );
              } else {
                // Si no es cliente, no necesita datos de tienda
                this.setDinamicClass = 'ion-hide';
                return of(null);
              }
            })
          );
        }),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError((error) => {
          console.error('❌ Error cargando perfil:', error);
          this.loadingError = 'Error al cargar los datos del perfil';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (storeData) => {
          if (storeData && this.isClient) {
            this.userStoreData = storeData;
            console.log('✅ Datos de tienda cargados:', storeData);

            // 🎯 Lógica para mostrar/ocultar botón de crear tienda
            this.setDinamicClass = storeData.storeInfo.bussinessName
              ? 'ion-hide'
              : '';
          }
        },
        error: (error) => {
          console.error('❌ Error final:', error);
        },
      });
  }

  /**
   * 🔄 Función para recargar datos (útil para pull-to-refresh)
   */
  refreshProfile(event?: any) {
    this.loadUserProfile();

    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  onCreateStore() {
    this.route.navigate(['/create-store']);
  }
}
