import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ServiceStoreData, UserStoreData, ServiceData } from '../types/store';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/standalone';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-store-service',
  templateUrl: './store-service.page.html',
  styleUrls: ['./store-service.page.scss'],
  standalone: false,
})
export class StoreServicePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  userStoreData: UserStoreData = {
    userUID: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
  };

  serviceStoreData: ServiceStoreData = {
    nombreServicio: '',
    descripcionServicio: '',
    tiempoEstimado: '',
    precio: 0,
  };

  serviceData: ServiceData = {
    storeId: '',
    serviceData: this.serviceStoreData,
  };

  constructor(
    private storeServ: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController
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

  async showToast(message: string) {
    const toast = await this.toast.create({
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
