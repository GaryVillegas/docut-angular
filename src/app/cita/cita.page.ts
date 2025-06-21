import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { date } from '../types/date.type';
import {
  TransactionRequest,
  CreateTransactionResponse,
} from '../types/transbank';
import { TransbankService } from '../transbank.service';
import { serviceData } from '../types/service.type';

@Component({
  selector: 'app-cita',
  templateUrl: './cita.page.html',
  styleUrls: ['./cita.page.scss'],
  standalone: false,
})
export class CitaPage implements OnInit {
  serviceId: string | null = null;
  serviceData: serviceData | null = null;
  cita: date = {
    fechaSeleccionada: '',
    horaSeleccionada: '',
    idNegocio: '',
    idServicio: '',
    nombreUsuario: '',
    apellidoUsuario: '',
    idUsuario: '',
  };
  newTransaction: TransactionRequest = {
    amount: 0,
    sessionId: '',
    buyOrder: '',
  };
  currentToken = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeServ: StoreService,
    private toastController: ToastController,
    private auth: AngularFireAuth,
    private route: Router,
    private transbankService: TransbankService
  ) {}

  ngOnInit() {
    this.serviceId = this.activatedRoute.snapshot.queryParamMap.get('id');
    if (!this.serviceId) {
      this.presentToast('Error', 'No hay un servicio seleccionado.', 'danger');
    } else {
      this.loadServiceData(this.serviceId);
    }
    this.minDate = new Date().toISOString();
    this.generateIds();
  }

  //cargar los datos del servicio
  async loadServiceData(id: string) {
    try {
      const result = await this.storeServ.getServiceById(id);
      this.serviceData = result;
      this.newTransaction.amount = Number(this.serviceData.serviceData.precio);
      console.log('service data: ', result);
    } catch (error) {
      this.presentToast('Error', 'error al obtener servicios.', 'danger');
    }
  }

  //algoritmo de seleccion
  selectedDate: string = '';
  minDate: string = '';

  //Actualizar fecha reciente
  onDateChange(event: any) {
    this.selectedDate = event.detail.value.substring(0, 10);
    console.log('Fecha seleccionada:', this.selectedDate);
    this.cita.fechaSeleccionada = this.selectedDate;
    this.nextSlide();
  }

  //seleccionar hora para la cita
  selectedHour: string = '';
  //select
  onTimeChange(event: any) {
    this.selectedHour = event.detail.value.slice(-8);
  }
  selectTimeNextSlide() {
    this.cita.horaSeleccionada = this.selectedHour;
    console.log('hora seleccioanda: ', this.selectedHour);
    this.nextSlide();
  }

  //Slides
  slide = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
  currentSlide = 0;

  nextSlide() {
    this.currentSlide++;
  }

  /**
   * TODO: With all the data, need to create a transbank check
   */
  async createDate() {
    const user = await this.auth.currentUser;
    if (
      !this.cita.fechaSeleccionada ||
      !this.cita.horaSeleccionada ||
      !this.cita.nombreUsuario ||
      !this.cita.apellidoUsuario
    ) {
      this.presentToast(
        'Error',
        'Por favor, complete todos los campos.',
        'danger'
      );
      return;
    }

    if (!user) {
      this.presentToast('Error', 'No hay un usuario autenticado.', 'danger');
      return;
    }

    if (!this.serviceId || !this.serviceData?.serviceData.storeId) {
      this.presentToast(
        'Error',
        'No se ha podido obtener la información del servicio. Por favor, inténtelo de nuevo.',
        'danger'
      );
      return;
    }

    this.cita.idServicio = this.serviceId;
    this.cita.idNegocio = this.serviceData.serviceData.storeId;
    this.cita.idUsuario = user.uid;

    // Aquí iría la lógica para guardar la cita en Firebase o donde sea necesario
    console.log('Datos de la cita listos para guardar:', this.cita);
    try {
      console.log(this.cita);
      await this.storeServ.createDate(this.cita);
      setTimeout(() => {
        this.route.navigate(['/tabs/home']);
      }, 3000);
    } catch (error) {
      console.log('error creando cita: ', error);
      this.presentToast(
        'Error',
        'Hubo un error al crear la cita. Por favor, inténtelo más tarde.',
        'danger'
      );
    }
  }

  //generando ids de la compra
  async generateIds() {
    const user = await this.auth.currentUser;
    if (!user) {
      this.presentToast('Error', 'No hay un usuario autenticado.', 'danger');
      return;
    }
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.newTransaction.sessionId = `session_${user.uid}`;
    this.newTransaction.buyOrder = `order_${timestamp}/${random}`;
  }

  async createTransaction() {
    const loading = await this.transbankService.showLoading(
      'Creando transacción...'
    );
    this.createDate();
    this.transbankService.createTransaction(this.newTransaction).subscribe({
      next: (response: CreateTransactionResponse) => {
        console.log('transaccion creada: ', response);
        loading.dismiss();

        if (response.success) {
          this.currentToken = response.token;
          this.transbankService.showToast(response.message);
          this.transbankService.redirectToWebpay(response.token, response.url);
        } else {
          this.transbankService.showToast(
            'Error al crear la transaccion.',
            'danger'
          );
        }
      },
      error: (error) => {
        console.error('Error al crear transaccion: ', error);
        loading.dismiss();
        if (error.error && error.error.error) {
          this.transbankService.showToast(error.error.error, 'danger');
        } else {
          this.transbankService.showToast('Error de conexión', 'danger');
        }
      },
    });
  }

  isAlertOpen = false;
  alertButtons = [
    {
      text: 'Presencial',
      role: 'cancel',
      handler: () => {
        this.nextSlide();
        setTimeout(() => {
          this.createDate();
        }, 2000);
      },
    },
    {
      text: 'Transferencia',
      role: 'confirm',
      handler: () => {
        this.createTransaction();
      },
    },
  ];

  setOpenAlert(isOpen: boolean) {
    this.isAlertOpen = isOpen;
  }

  cancelar() {
    this.route.navigate(['/tabs/home']);
  }

  //toas
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
