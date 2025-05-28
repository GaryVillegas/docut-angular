import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { getUserStoreData } from '../types/store';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: false,
})
export class StorePage implements OnInit {
  userStoreData: getUserStoreData = {
    userUID: '',
    documentId: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
  };

  constructor(
    private storeServ: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController,
    private route: Router
  ) {}

  ngOnInit() {
    this.getInfoStore();
  }

  async getInfoStore() {
    const user = await this.auth.currentUser;
    if (!user) {
      this.showAlert('No hay un usuario autenticado.');
      return;
    }
    await this.storeServ.getStoreByUID(user.uid).subscribe((storeData) => {
      this.userStoreData = storeData;
      console.log(storeData);
    });
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

  goToServiceStore() {
    this.route.navigate(['store-service']);
  }

  isAlertDeleteOpen = false;
  setAlertDeleteOpen(isOpen: boolean) {
    this.isAlertDeleteOpen = isOpen;
    console.log(isOpen);
  }

  public alertDeleteButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        this.setAlertDeleteOpen(false);
      },
    },
    {
      text: 'Si',
      role: 'confirm',
      handler: () => {
        this.deleteStore();
      },
    },
  ];

  async deleteStore() {
    try {
      await this.storeServ.deleteStore(this.userStoreData.documentId);
      await this.storeServ.updateUserType(
        this.userStoreData.userUID,
        'cliente'
      );
      this.setAlertDeleteOpen(false);
      this.showToast('Exito', '✅ Tienda Eliminada');
    } catch (error) {
      console.error('❌ Error eliminar tienda:', error);
      this.showAlert('❌ Error eliminar tienda');
    }
  }

  isModalSettingsOpen = false;
  setModalSettingsOpen(isOpenSetting: boolean) {
    this.isModalSettingsOpen = isOpenSetting;
  }
}
