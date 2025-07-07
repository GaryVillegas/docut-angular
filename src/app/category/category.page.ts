import { Component, OnInit } from '@angular/core';
import { storeData } from '../types/store.type';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { serviceData } from '../types/service.type';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: false,
})
export class CategoryPage implements OnInit {
  categoryName: string | null = null;
  stores: storeData[] = [];
  serviceStore: serviceData[] = [];
  isLoading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private storeService: StoreService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.categoryName = this.activatedRoute.snapshot.queryParamMap.get('name');
    if (!this.categoryName) {
      this.presentToast('Error', 'No hay un servicio seleccionado.', 'danger');
    } else {
      this.loadStores(this.categoryName);
    }
  }

  private async loadStores(name: string) {
    try {
      const result = await this.storeService.getStoreByCategory(name);
      this.stores = result ?? [];
      this.isLoading = false;
    } catch (error) {
      this.presentToast('Error', 'error al buscar las tiendas.', 'danger');
    }
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

  //Metodo para obtener los servicios de la tienda
  private async loadStoreService(storeId: string) {
    try {
      const result = await this.storeService.getServicesByStoreId(storeId);
      this.serviceStore = result;
    } catch (error) {
      this.presentToast(
        'Error',
        'error buscar los servicios de la tienda',
        'danger'
      );
    }
  }

  // Método para obtener la tienda seleccionada
  getSelectedStore(): storeData | undefined {
    if (!this.storeSelected) return undefined;
    return this.stores.find((store) => store.storeId === this.storeSelected);
  }

  //Mandar datos a cita
  createDate(serviceId: string) {
    this.setModalStore(false, null);
    this.route.navigate(['/cita'], { queryParams: { id: serviceId } });
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
