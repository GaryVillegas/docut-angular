import { Component, type OnInit, ViewChild } from '@angular/core';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import type { IonPopover } from '@ionic/angular/standalone';
import { service, serviceData } from '../types/service.type';
@Component({
  selector: 'app-store-service',
  templateUrl: './store-service.page.html',
  styleUrls: ['./store-service.page.scss'],
  standalone: false,
})
export class StoreServicePage implements OnInit {
  @ViewChild('popover') popover!: IonPopover;
  user: any | null = null;
  storeId: string | undefined;
  serviceData: serviceData[] | undefined;

  newService: service = {
    nombreServicio: '',
    descripcionServicio: '',
    tiempoEstimado: '',
    precio: 0,
    storeId: '',
  };

  // 🎛️ Estados de la interfaz
  isCreateModalOpen = false;
  currentSlideIndex = 0;
  isLoading = false;

  // 💬 Popover (ayuda)
  isOpenPopOver = false;
  currentPopoverContent = '';
  popoverContents: { [key: string]: string } = {
    btn1: 'Aqui especificas el nombre del servicio.',
    btn2: 'Aqui especificas lo que se hacer en el servicio',
    btn3: 'Aqui se coloca el valor del servico. (sin puntos o comas)',
    btn4: 'Aqui solo pon el numero entero de horas que toma el servicio.',
  };

  constructor(
    private storeService: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    this.user = await this.auth.currentUser;
    this.loadData();
  }

  /**
   * 🚀 FUNCIÓN PRINCIPAL - Carga todos los datos
   * Solo una llamada al servicio, él hace todo el trabajo
   */
  private async loadData() {
    this.isLoading = true;
    try {
      if (!this.user) {
        this.showAlert('No estas autenticado');
        return;
      }
      const storeData = await this.storeService.getStoreID(this.user.uid);
      this.storeId = storeData;
      if (this.storeId) {
        const serviceData = await this.storeService.getStoreServices(
          this.storeId
        );
        this.serviceData = serviceData;
        console.log('Servicios encontrados.');
      }
      console.log('storeId encontrador');
    } catch (error) {
      this.showAlert('Error al cargar storeId.');
    } finally {
      this.isLoading = false;
    }
  }

  async createService() {
    if (!this.isValidService()) return;
    this.isLoading = true;
    try {
      if (!this.storeId) return;
      await this.storeService.createService(this.storeId, this.newService);
      this.setOpenCreateModal(false);
      this.showToast('Servicio Creado!');
      this.loadData();
    } catch (error) {
      console.error('❌ Error:', error);
      this.showAlert('Error al crear servicio');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * ✅ Validar datos del servicio
   */
  private isValidService(): boolean {
    if (!this.newService.nombreServicio) {
      this.showAlert('Falta el nombre del servicio');
      return false;
    }
    if (!this.newService.descripcionServicio) {
      this.showAlert('Falta la descripción');
      return false;
    }
    if (this.newService.precio <= 0) {
      this.showAlert('El precio debe ser mayor a 0');
      return false;
    }
    if (!this.newService.tiempoEstimado) {
      this.showAlert('Falta el tiempo estimado');
      return false;
    }
    return true;
  }

  /**
   * 🧹 Limpiar formulario
   */
  private resetForm() {
    this.newService = {
      nombreServicio: '',
      descripcionServicio: '',
      tiempoEstimado: '',
      precio: 0,
      storeId: '',
    };
    this.currentSlideIndex = 0;
  }

  private resetEditForm() {
    this.editService = {
      nombreServicio: '',
      descripcionServicio: '',
      tiempoEstimado: '',
      precio: 0,
      storeId: '',
    };
    this.currentSlideIndex = 0;
  }

  // 🎛️ Funciones de la interfaz (simples)
  setOpenCreateModal(isOpen: boolean) {
    this.isCreateModalOpen = isOpen;
    if (!isOpen) this.resetForm();
  }

  nextSlide() {
    this.currentSlideIndex = 1;
  }

  prevSlide() {
    this.currentSlideIndex = 0;
  }

  presentPopover(event: Event, buttonId: string) {
    this.currentPopoverContent = this.popoverContents[buttonId];
    this.popover.event = event;
    this.isOpenPopOver = true;
  }

  // 💬 Notificaciones
  private async showToast(message: string) {
    const toast = await this.toast.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  private async showAlert(message: string) {
    const toast = await this.toast.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }

  //Serbice options
  @ViewChild('optionsPopover') optionsPopover!: IonPopover;
  isOptionsPopoverOpen = false;
  currentService: any = null;
  isModalServiceOpen = false;

  setModalServiceOpen(isOpen: boolean) {
    this.isModalServiceOpen = isOpen;
    if (!isOpen) {
      this.resetEditForm();
      this.currentService = null;
    }
  }

  openServiceOptions(event: Event, service: any) {
    this.currentService = service;
    this.optionsPopover.event = event;
    this.isOptionsPopoverOpen = true;
    console.log('Abrir opciones para servicio:', service);
  }

  // ✏️ Datos del formulario para editar servicio
  editService: service = {
    nombreServicio: '',
    descripcionServicio: '',
    tiempoEstimado: '',
    precio: 0,
    storeId: '',
  };

  editCurrentService() {
    if (this.currentService) {
      console.log('Editar servicio:', this.currentService); //debuging
      this.editService = {
        nombreServicio: this.currentService.serviceData.nombreServicio || '',
        descripcionServicio:
          this.currentService.serviceData.descripcionServicio || '',
        tiempoEstimado: this.currentService.serviceData.tiempoEstimado || '',
        precio: this.currentService.serviceData.precio || 0,
        storeId: this.currentService.serviceData.storeId || '',
      };
      this.setModalServiceOpen(true);
    }
  }

  async editServiceData() {
    if (this.currentService && this.currentService.serviceId) {
      try {
        await this.storeService.updateService(
          this.currentService.serviceId,
          this.editService
        );
        this.setModalServiceOpen(false);
        this.resetEditForm();
        this.loadData();
        this.showToast('✅ Servicio editado');
      } catch (error) {
        console.log('error al editar servicio: ', error);
        this.showAlert('❌Error al editar servicio.');
      }
    }
  }

  //delete service
  isAlertServiceOpen = false;
  setAlertServiceOpen(isOpen: boolean) {
    this.isAlertServiceOpen = isOpen;
  }

  async deleteService() {
    if (this.currentService && this.currentService.serviceId) {
      try {
        await this.storeService.deleteService(this.currentService.serviceId);
        this.setAlertServiceOpen(false);
        this.isOptionsPopoverOpen = false;
        this.showToast('✅ Servicio eliminado');
        this.loadData(); // Recargar para reflejar cambios
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        this.showAlert('Error al eliminar servicio');
      }
    } else {
      this.showAlert('No se pudo identificar el servicio a eliminar');
    }
  }

  public alertServiceButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        this.setAlertServiceOpen(false);
      },
    },
    {
      text: 'Si',
      role: 'confirm',
      handler: () => {
        this.deleteService();
      },
    },
  ];

  deleteCurrentService() {
    if (this.currentService) {
      console.log('Eliminar servicio:', this.currentService);
      this.setAlertServiceOpen(true);
    }
  }
}
