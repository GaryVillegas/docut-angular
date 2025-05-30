import { Component, type OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap, finalize, catchError } from 'rxjs/operators';
import type { UserStoreData } from '../types/store';
import type { UserData } from '../types/user';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
    private storeServ: StoreService,
    private toast: ToastController,
    private auth: AngularFireAuth
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
  async loadUserProfile() {
    this.isLoading = true;
    this.loadingError = null;

    try {
      const user = await this.auth.currentUser;
      if (!user) {
        this.showAlert('No hay un usuario autenticado.');
        this.isLoading = false;
        return;
      }

      console.log('✅ Usuario encontrado:', user.uid);

      // 📊 Cargar datos del usuario
      this.storeServ
        .getUserData(user.uid)
        .pipe(
          switchMap((userData) => {
            this.userData = userData;
            this.isClient = userData.userInfoData.tipe === 'cliente';

            console.log('✅ Datos de usuario cargados:', userData);

            // 🏪 Si es cliente, cargar datos de tienda
            if (this.isClient) {
              return this.storeServ.getStoreData(user.uid).pipe(
                catchError((error) => {
                  console.warn('⚠️ Error cargando tienda:', error);
                  return of(this.userStoreData);
                })
              );
            } else {
              this.setDinamicClass = 'ion-hide';
              return of(null);
            }
          }),
          finalize(() => {
            this.isLoading = false;
          }),
          catchError((error) => {
            console.error('❌ Error cargando perfil:', error);
            this.loadingError = 'Error al cargar los datos del perfil';
            return of(null);
          })
        )
        .subscribe({
          next: (storeData) => {
            if (storeData && this.isClient) {
              this.userStoreData = storeData;
              console.log('✅ Datos de tienda cargados:', storeData);
              this.setDinamicClass = storeData.storeInfo.bussinessName
                ? 'ion-hide'
                : '';
            }
          },
          error: (error) => {
            console.error('❌ Error final:', error);
          },
        });
    } catch (error) {
      console.error('❌ Error esperando auth state:', error);
      this.showAlert('Error de autenticación.');
      this.isLoading = false;
    }
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

  //User modal
  isModalUserOpen = false;
  setModalUserOpen(isOpen: boolean) {
    this.isModalUserOpen = isOpen;
  }

  async updateUserData() {
    try {
      await this.storeServ.updateUser(
        this.userData.UID,
        this.userData.userInfoData
      );
      this.showToast('Exito', '✅ Usuario editado con exito.');
      this.isLoading = false;
      this.setModalUserOpen(false);
    } catch (error) {
      this.showAlert('❌ Error al editar usuario.');
      console.log('error al editar usuario: ', error);
      this.isLoading = false;
    }
  }

  onCreateStore() {
    this.route.navigate(['/create-store']);
  }

  async showToast(header: string, message: string) {
    const toast = await this.toast.create({
      header,
      message,
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  async showAlert(message: string) {
    const toast = await this.toast.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
