import { Component, OnInit, ViewChild } from '@angular/core';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { serviceData } from '../types/service.type';
import { storeData } from '../types/store.type';
import { dateData } from '../types/date.type';
import type { IonPopover } from '@ionic/angular/standalone';

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
  categories = [
    'Barbería',
    'Canina',
    'Spa',
    'Salón de Belleza',
    'Peluquería',
    'Manicure',
    'Pedicure',
    'Depilación',
  ];

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
    await this.automaticCancel();
    await this.loadStoreDates();
    await this.loadUserStoreAndDates(user.uid);
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
      if (!result) {
        this.cita = null;
        this.serviceCitaName = null;
        this.dateId = null; // Añade esto
        return;
      }

      this.cita = result;
      this.dateId = result.dateId; // ¡ASIGNA EL ID AQUÍ!

      if (result) {
        const service = await this.storeServ.getServiceName(
          result.dateData.idServicio
        );
        this.serviceCitaName = service;
      }
      await this.automaticCancel();
    } catch (error) {
      this.presentToast('Error', 'Error al buscar la cita.', 'danger');
    }
  }

  //Mandar datos a cita
  createDate(serviceId: string) {
    this.setModalStore(false, null);
    this.route.navigate(['/cita'], { queryParams: { id: serviceId } });
  }

  fetchCategory(name: string) {
    this.route.navigate(['/category'], { queryParams: { name: name } });
  }

  @ViewChild('optionsPopover') optionsPopover!: IonPopover;
  isOptionsPopoverOpen = false;
  dateId: string | null = null;

  openServiceOptions(event: Event, date: string) {
    this.dateId = date;
    this.optionsPopover.event = event;
    this.isOptionsPopoverOpen = true;
    console.log('Abrir opciones para servicio:', date);
  }

  //delete service
  isAlertServiceOpen = false;
  setAlertServiceOpen(isOpen: boolean) {
    this.isAlertServiceOpen = isOpen;
  }

  async updateDateStatus() {
    if (this.dateId) {
      try {
        await this.storeServ.updateDateStatus(this.dateId, 'cancelada');
        const user = await this.auth.currentUser;
        if (!user) return;
        this.loadDate(user.uid);
        this.setAlertServiceOpen(false);
        this.isOptionsPopoverOpen = false;
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        this.presentToast('Error', 'Error al buscar una la cita.', 'danger');
      }
    }
  }

  public alertServiceButtons = [
    {
      text: 'No',
      role: 'cancel',
      handler: () => {
        this.setAlertServiceOpen(false);
      },
    },
    {
      text: 'Si',
      role: 'confirm',
      handler: () => {
        this.updateDateStatus();
      },
    },
  ];

  updateCurrentDate() {
    if (this.dateId) {
      this.isAlertServiceOpen = true;
    }
  }

  async automaticCancel() {
    if (!this.dateId || !this.cita) return;

    const fechaCita = this.cita.dateData.fechaSeleccionada;
    const horaCita = this.cita.dateData.horaSeleccionada;

    try {
      const ahora = new Date();
      const fechaHoy = ahora.toISOString().split('T')[0];

      // Crear objeto Date para la cita
      const [anio, mes, dia] = fechaCita.split('-').map(Number);
      const [horas, minutos] = horaCita.split(':').map(Number);
      const fechaHoraCita = new Date(anio, mes - 1, dia, horas, minutos);

      // Verificar si la cita ya pasó
      if (fechaHoraCita < ahora) {
        await this.marcarCitaVencida();
      } else {
        console.log('La cita sigue activa');
      }
    } catch (error) {
      console.error('Error al verificar la cita:', error);
      this.presentToast('Error', 'Error al verificar la cita', 'danger');
    }
  }

  private async marcarCitaVencida(): Promise<void> {
    if (this.dateId) {
      try {
        await this.storeServ.updateDateStatus(this.dateId, 'cancelada');
        // Restablece los datos locales
        this.cita = null;
        this.serviceCitaName = null;
        this.presentToast(
          'DoCut',
          'Su cita ha vencido y ha sido cancelada automáticamente',
          'warning'
        );
      } catch (error) {
        console.error('Error al tratar de editar la cita: ', error);
        this.presentToast('Error', 'Error al actualizar la cita.', 'danger');
      }
    }
  }

  private async loadUserStoreAndDates(userUID: string) {
    try {
      // Obtener la tienda del usuario
      const userStore = await this.storeServ.getUserStore(userUID);

      if (userStore && userStore.storeId) {
        console.log(
          '✅ Usuario tiene tienda:',
          userStore.storeInfo.bussinessName
        );

        // Asignar como tienda seleccionada
        this.storeSelected = userStore.storeId;

        // Cargar las citas de su tienda
        await this.loadStoreDates();
      } else {
        console.log('❌ Usuario no tiene tienda');
        this.storeDates = [];
      }
    } catch (error) {
      console.error('Error cargando tienda del usuario:', error);
      this.storeDates = [];
    }
  }

  storeDates: dateData[] = [];

  async loadStoreDates() {
    const selectedStore = this.getSelectedStore();
    console.log(selectedStore);
    if (selectedStore?.storeId) {
      try {
        const result = await this.storeServ.getStoreDate(selectedStore.storeId);
        this.storeDates = result || []; // Corregir la lógica aquí
      } catch (error) {
        this.storeDates = [];
        this.presentToast(
          'Error',
          'error al obtener las citas de la tienda.',
          'danger'
        );
      }
    } else {
      this.storeDates = [];
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
