import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from '../store.service';
import { getServiceData } from '../types/store';
import { ToastController } from '@ionic/angular';
import { tap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { cita } from '../types/date';

@Component({
  selector: 'app-cita',
  templateUrl: './cita.page.html',
  styleUrls: ['./cita.page.scss'],
  standalone: false,
})
export class CitaPage implements OnInit {
  serviceId: string | null = null;
  serviceData: getServiceData | null = null;
  cita: cita = {
    fechaSeleccionada: '',
    horaSeleccionada: '',
    idNegocio: '',
    idServicio: '',
    nombreUsuario: '',
    apellidoUsuario: '',
    idUsuario: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeServ: StoreService,
    private toastController: ToastController,
    private auth: AngularFireAuth,
    private route: Router
  ) {}

  ngOnInit() {
    this.serviceId = this.activatedRoute.snapshot.queryParamMap.get('id');
    if (!this.serviceId) {
      this.presentToast('Error', 'No hay un servicio seleccionado.', 'danger');
    } else {
      this.loadServiceData(this.serviceId);
    }
    this.minDate = new Date().toISOString();
  }

  //cargar los datos del servicio
  loadServiceData(id: string) {
    this.storeServ
      .getServiceById(id)
      .pipe(
        tap((data) => {
          this.serviceData = data;
          console.log('Service Data: ', data);
        })
        /**\
         * tap: Para efectos secundarios (console.log, asignaciones, llamadas a funciones que no retornan datos)
         */
      )
      .subscribe();
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
   * TODO: create a date in firebase to save the date store
   * handle data like id, fechaSeleccionada, horaSeleccionada, idNegocio, idServicio.
   * @cita, this attribute get all de data
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

    if (!this.serviceId || !this.serviceData?.storeId) {
      this.presentToast(
        'Error',
        'No se ha podido obtener la información del servicio. Por favor, inténtelo de nuevo.',
        'danger'
      );
      return;
    }

    this.cita.idServicio = this.serviceId;
    this.cita.idNegocio = this.serviceData.storeId;
    this.cita.idUsuario = user.uid;

    // Aquí iría la lógica para guardar la cita en Firebase o donde sea necesario
    console.log('Datos de la cita listos para guardar:', this.cita);
    try {
      await this.storeServ.createCita(this.cita);
      this.nextSlide();
      setTimeout(() => {
        this.route.navigate(['/tabs/home']);
      }, 5000);
    } catch (error) {
      this.presentToast(
        'Error',
        'Hubo un error al crear la cita. Por favor, inténtelo de nuevo.',
        'danger'
      );
    }
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
