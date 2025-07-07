import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { serviceData } from '../types/service.type';
import { storeData } from '../types/store.type';
import { dateData } from '../types/date.type';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  stores: storeData[] = [];
  serviceStore: serviceData[] = [];
  cita: dateData | null = null;
  serviceCitaName: string | null = null;

  isLoading = true;

  constructor(
    private storeServ: StoreService,
    private toastController: ToastController,
    private route: Router,
    private auth: AngularFireAuth
  ) {}

  async ngOnInit() {
    const user = await this.auth.currentUser;
    if (!user) return;
    await this.loadStores();
    await this.loadDate(user.uid);
  }

  async ionViewWillEnter() {
    const user = await this.auth.currentUser;
    if (!user) return;
    if (this.storeServ.shouldReloadStores) {
      await this.loadStores();
      this.storeServ.shouldReloadStores = false;
    }
    if (this.storeServ.shouldReloadDate) {
      await this.loadDate(user.uid);
      this.storeServ.shouldReloadDate = false;
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

  // Método para obtener la tienda seleccionada
  getSelectedStore(): storeData | undefined {
    if (!this.storeSelected) return undefined;
    return this.stores.find((store) => store.storeId === this.storeSelected);
  }

  private async loadStores() {
    try {
      const result = await this.storeServ.getAllStores();
      this.stores = result;
      this.isLoading = false;
    } catch (error) {
      this.presentToast('Error', 'error al buscar las tiendas.', 'danger');
    }
  }

  //Metodo para obtener los servicios de la tienda
  private async loadStoreService(storeId: string) {
    try {
      const result = await this.storeServ.getServicesByStoreId(storeId);
      this.serviceStore = result;
    } catch (error) {
      this.presentToast(
        'Error',
        'error buscar los servicios de la tienda',
        'danger'
      );
    }
  }

  private async loadDate(userUID: string) {
    try {
      const result = await this.storeServ.getUserDate(userUID);
      if (!result) return;
      if (result) {
        const service = await this.storeServ.getServiceName(
          result.dateData.idServicio
        );
        this.serviceCitaName = service;
      }
      this.cita = result;
    } catch (error) {
      this.presentToast('Error', 'Error al buscar una la cita.', 'danger');
    }
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
