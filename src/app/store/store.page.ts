import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { UserStoreData } from '../types/store';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: false,
})
export class StorePage implements OnInit {
  userStoreData: UserStoreData = {
    userUID: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
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
