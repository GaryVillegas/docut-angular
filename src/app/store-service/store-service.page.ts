import {
  Component,
  type OnInit,
  type OnDestroy,
  ViewChild,
} from '@angular/core';
import type { ServiceStoreData, StoreCompleteData } from '../types/store';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastController } from '@ionic/angular';
import type { IonPopover } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-store-service',
  templateUrl: './store-service.page.html',
  styleUrls: ['./store-service.page.scss'],
  standalone: false,
})
export class StoreServicePage implements OnInit, OnDestroy {
  @ViewChild('popover') popover!: IonPopover;

  // 🧹 Para limpiar suscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // 📊 TODOS los datos que necesita la página en una sola variable
  storeData: StoreCompleteData = {
    storeInfo: {
      userUID: '',
      storeInfo: { bussinessName: '', direction: '', categories: [] },
    },
    storeIds: [],
    services: [],
  };

  // 📝 Datos del formulario para crear servicio
  newService: ServiceStoreData = {
    nombreServicio: '',
    descripcionServicio: '',
    tiempoEstimado: '',
    precio: 0,
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
    btn4: 'Aqui solo pon el numero de horas que toma el servicio.',
  };

  constructor(
    private storeServ: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🚀 FUNCIÓN PRINCIPAL - Carga todos los datos
   * Solo una llamada al servicio, él hace todo el trabajo
   */
  private loadData() {
    this.isLoading = true;

    this.auth.authState.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        if (!user) {
          this.showAlert('No estás autenticado');
          this.isLoading = false;
          return;
        }

        // 🎯 UNA SOLA LLAMADA - el servicio hace todo
        this.storeServ
          .getCompleteStoreData(user.uid)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data) => {
              this.storeData = data;
              console.log('📊 Datos cargados:', data);
              this.isLoading = false;
            },
            error: (error) => {
              console.error('❌ Error:', error);
              this.showAlert('Error al cargar datos');
              this.isLoading = false;
            },
          });
      },
    });
  }

  /**
   * ➕ Crear nuevo servicio - ALGORITMO ORIGINAL CON STOREID
   */
  async createService() {
    // Validar datos
    if (!this.isValidService()) return;

    this.isLoading = true;

    try {
      const user = await this.auth.currentUser;
      if (!user) throw new Error('No estás autenticado');

      // 🔥 ALGORITMO ORIGINAL: Obtener storeId primero
      const storeIds = await this.storeServ.getStoreIdsByUserUID(user.uid);

      if (storeIds.length === 0) {
        throw new Error('No tienes tiendas creadas');
      }

      // 🔥 USAR EL MÉTODO ORIGINAL CON STOREID
      await this.storeServ.createServiceStore(storeIds[0], this.newService);

      // Éxito
      this.showToast('✅ Servicio creado');
      this.resetForm();
      this.setOpenCreateModal(false);
      this.loadData(); // Recargar para mostrar el nuevo servicio
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

  handleSubmit() {
    this.createService();
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
}
