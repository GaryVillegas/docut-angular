import { Component, OnInit } from '@angular/core';
import { getUserStoreData } from '../types/store';
import { StoreService } from '../store.service';
import { AuthService } from '../auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  stores: getUserStoreData[] = [];
  constructor(
    private storeServ: StoreService,
    private toastController: ToastController,
    private authServ: AuthService
  ) {}

  ngOnInit() {
    this.storeServ.getAllStores().subscribe((stores) => {
      this.stores = stores;
      console.log('Todas las Tiendas', stores);
    });
  }

  async presentToast(header: string, message: string, color: string) {
    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: 2000,
      position: 'top',
      color: color,
    });
    toast.present();
  }
}
