import { Component, OnInit } from '@angular/core';
import { getUserStoreData, ServiceData } from '../types/store';
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
    console.log('Tienda seleccionada:', storeSelectedId);
    console.log('Modal abierto:', isOpen);
  }

  // Método para obtener la tienda seleccionada
  getSelectedStore(): getUserStoreData | undefined {
    if (!this.storeSelected) return undefined;
    return this.stores.find((store) => store.documentId === this.storeSelected);
  }

  //Modal Service Store
  isModalStoreService = true;
  storeId: string | null = null;
  services: ServiceData[] = [];
  setModalStoreService(isOpen: boolean, storeId: string) {
    this.isModalStoreService = isOpen;
    this.storeId = storeId;
    this.getServiceStore(storeId);
    console.log('ID de la tienda seleccionada:', storeId);
    console.log('Modal de servicio abierto:', isOpen);
  }

  async getServiceStore(storeId: string) {
    try {
      this.isLoading = true; // Mostrar indicador de carga
      const services = await this.storeServ
        .getServicesByStoreId(storeId)
        .toPromise();
      console.log('Servicios de la tienda:', services);

      // Asignar servicios o array vacío
      this.services = services || [];

      this.isLoading = false; // Ocultar indicador de carga
      return services;
    } catch (error) {
      this.isLoading = false; // Asegurarse de ocultar el indicador de carga en caso de error
      console.error('Error al obtener los servicios de la tienda:', error);
      this.presentToast(
        'Error',
        'No se pudieron cargar los servicios de la tienda.',
        'danger'
      );
      this.services = []; // Asignar array vacío en caso de error
      return [];
    }
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
