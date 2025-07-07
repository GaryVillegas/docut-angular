import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { storeData } from '../types/store.type';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: false,
})
export class StorePage implements OnInit {
  storeData: storeData | undefined;
  isLoading = true;

  constructor(
    private storeServ: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController,
    private route: Router,
    private cdRef: ChangeDetectorRef
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
    try {
      const result = await this.storeServ.getUserStore(user.uid);
      this.storeData = result;
      this.toggleLabel = this.storeData?.storeStatus.statusCondition
        ? 'Tienda Abierta'
        : 'Tienda Cerrada';
      this.isLoading = false;
      this.isLoading = false;
    } catch (error) {
      console.log('error al buscar tienda: ', error);
      this.showAlert('Error al buscar su tienda.');
      this.isLoading = false;
    }
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
    // console.log(isOpen);
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
      if (!this.storeData) return;
      await this.storeServ.deleteStore(this.storeData?.storeId);
      await this.storeServ.updateUserTipe(
        this.storeData?.storeInfo.userUID,
        'cliente'
      );
      this.setAlertDeleteOpen(false);
      this.isLoading = false;
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

  categories = [
    'Barbería',
    'Spa',
    'Salón de Belleza',
    'Peluquería',
    'Manicure',
    'Pedicure',
    'Depilación',
  ];

  toggleCategory(category: string) {
    if (!this.storeData) return;
    const index = this.storeData.storeInfo?.categories.indexOf(category);
    if (index > -1) {
      this.storeData.storeInfo?.categories.splice(index, 1);
    } else {
      this.storeData.storeInfo.categories.push(category);
    }
    this.cdRef.markForCheck();
  }

  isCategorySelected(category: string): boolean {
    if (!this.storeData) return false;
    return this.storeData.storeInfo.categories.includes(category);
  }

  async updateStore() {
    if (!this.storeData) return;
    try {
      await this.storeServ.updateStore(
        this.storeData.storeId,
        this.storeData.storeInfo
      );
      this.showToast('Exito', '✅ Tienda actualizada');
      this.isLoading = false;
      this.setModalSettingsOpen(false);
    } catch (erro) {
      console.error('❌ Error actualizando tienda:', erro);
      this.showAlert('❌ Error al actualizar tienda');
    }
  }

  async updateStoreStatus() {
    if (!this.storeData) return;
    try {
      await this.storeServ.updateStoreStatus(
        this.storeData.storeId,
        this.storeData.storeStatus
      );
      this.isLoading = false;
    } catch (erro) {
      console.error('❌ Error actualizando estado de tienda:', erro);
      this.showAlert('❌ Error al actualizar tienda');
    }
  }

  //isOpenStore Toggle
  toggleLabel: string = '';

  onToggleChange() {
    if (!this.storeData) return;
    // Actualiza el label según el nuevo estado
    this.toggleLabel = this.storeData.storeStatus.statusCondition
      ? 'Tienda Abierta'
      : 'Tienda Cerrada';
    // Llama a la función para actualizar en Firebase
    this.updateStoreStatus();
  }
}
