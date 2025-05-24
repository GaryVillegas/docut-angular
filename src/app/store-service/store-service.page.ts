import { Component, OnInit, ViewChild } from '@angular/core';
import { ServiceStoreData, UserStoreData, ServiceData } from '../types/store';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import { IonPopover } from '@ionic/angular/standalone';

@Component({
  selector: 'app-store-service',
  templateUrl: './store-service.page.html',
  styleUrls: ['./store-service.page.scss'],
  standalone: false,
})
export class StoreServicePage implements OnInit {
  @ViewChild('popover') popover!: IonPopover;

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
    this.getStoreIds();
  }
  storeIds: string[] = [];
  async getStoreIds() {
    try {
      const user = await this.auth.currentUser;
      if (!user) {
        this.showAlert('No hay un usuario autenticado.');
        return;
      }

      this.storeIds = await this.storeServ.getStoreIdsByUserUID(user.uid);
      console.log('IDs de tiendas:', this.storeIds);
    } catch (error) {
      this.showAlert('Error al obtener los IDs de tiendas');
      console.error(error);
    }
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

  //Modal Config
  isCreateModalOpen = false;
  setOpenCreateModal(isOpen: boolean) {
    this.isCreateModalOpen = isOpen;
  }

  //mdoal carrousel input
  currentSlideIndex = 0;
  slides = [{ id: '1' }, { id: '2' }];
  nextSlide() {
    this.currentSlideIndex++;
  }

  prevSlide() {
    this.currentSlideIndex--;
  }

  async handleSubmit() {
    await this.storeServ.createServiceStore(
      this.storeIds[0],
      this.serviceStoreData
    );
    this.showToast('Servicio creado correctamente.');
    this.setOpenCreateModal(false);
  }

  //POPOVERS
  isOpenPopOver = false;
  currentPopoverContent = '';
  currentButtonId = '';

  // Datos para cada popover (puedes obtenerlos de una API o servicio)
  popoverContents: { [key: string]: string } = {
    btn1: 'Aqui especificas el nombre del servicio.',
    btn2: 'Aqui especificas lo que se hacer en el servicio',
    btn3: 'Aqui se coloca el valor del servico. (sin puntos o comas)',
    btn4: 'Aqui solo pon el numero de horas que toma el servicio.',
  };

  presentPopover(event: Event, buttonId: string) {
    this.currentButtonId = buttonId;
    this.currentPopoverContent =
      this.popoverContents[buttonId] || 'Contenido predeterminado';
    this.popover.event = event;
    this.isOpenPopOver = true;
  }
}
