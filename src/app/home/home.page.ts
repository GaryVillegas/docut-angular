import { Component, OnInit } from '@angular/core';
import { getUserStoreData, getServiceData } from '../types/store';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  stores: getUserStoreData[] = [];
  serviceStore: getServiceData[] = [];

  isLoading = true;

  constructor(
    private storeServ: StoreService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.storeServ.getAllStores().subscribe((stores) => {
      this.stores = stores;
      this.isLoading = false;
      console.log('Todas las Tiendas', stores);
    });
  }

  //Store Modal View
  isModalStore = false;
  storeSelected: string | null = null;

  setModalStore(isOpen: boolean, storeSelectedId: string | null) {
    this.isModalStore = isOpen;
    this.storeSelected = storeSelectedId;
    if (isOpen && storeSelectedId) {
      this.loadStoreService(storeSelectedId);
      this.isLoading = false;
    } else {
      //limpiar servicios cuando se cierra el modal
      this.serviceStore = [];
    }
    console.log('Tienda seleccionada:', storeSelectedId);
    console.log('Modal abierto:', isOpen);
  }

  // Método para obtener la tienda seleccionada
  getSelectedStore(): getUserStoreData | undefined {
    if (!this.storeSelected) return undefined;
    return this.stores.find((store) => store.documentId === this.storeSelected);
  }

  //Metodo para obtener los servicios de la tienda
  private loadStoreService(storeId: string) {
    this.storeServ.getServicesByStoreId(storeId).subscribe((services) => {
      this.serviceStore = services;
      console.log('servicios cargados: ', this.serviceStore);
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
