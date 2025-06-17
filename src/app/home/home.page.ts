import { Component, OnInit } from '@angular/core';
import { getUserStoreData, getServiceData } from '../types/store';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getCita } from '../types/date';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  stores: getUserStoreData[] = [];
  serviceStore: getServiceData[] = [];
  cita: getCita | null = null;

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
    this.storeServ.getAllStores().subscribe((stores) => {
      this.stores = stores;
      this.isLoading = false;
      console.log('Todas las Tiendas', stores);
    });
    this.storeServ.getCitaData(user.uid).subscribe((citaDoc) => {
      if (citaDoc) {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const fechaCita = citaDoc.citaData.fechaSeleccionada;
        console.log(citaDoc.citaData.idUsuario);
        if (user.uid == citaDoc.citaData.idUsuario) {
          if (fechaCita === fechaHoy) {
            this.cita = citaDoc;
            console.log(this.cita);
          } else {
            this.cita = null;
            console.log('No se encontro cita');
          }
        } else {
          this.cita = null;
          console.log('No se encontro cita');
        }
      } else {
        this.cita = null;
      }
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
