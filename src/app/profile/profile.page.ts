import { Component, type OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { userData } from '../types/user.type';
import { storeData } from '../types/store.type';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userData: userData = {
    UID: '',
    userInfo: {
      name: '',
      lastName: '',
      rut: '',
      tipe: '',
    },
  };

  userStoreData: storeData = {
    storeId: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
      userUID: '',
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
      const userData = await this.storeServ.getUserData(user.uid);
      if (userData) {
        this.userData = userData;
        const storeData = await this.storeServ.getUserStore(user.uid);
        if (storeData) {
          this.userStoreData = storeData;
          console.log('Tienda encontrada');
        }
      }
      console.log('Usuario encontrado');
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
        this.userData.userInfo
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
