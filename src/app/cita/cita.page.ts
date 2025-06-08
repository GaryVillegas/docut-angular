import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../store.service';
import { ServiceData } from '../types/store';
import { ToastController } from '@ionic/angular';
import { tap } from 'rxjs';

@Component({
  selector: 'app-cita',
  templateUrl: './cita.page.html',
  styleUrls: ['./cita.page.scss'],
  standalone: false,
})
export class CitaPage implements OnInit {
  serviceId: string | null = null;
  serviceData: ServiceData | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private storeServ: StoreService,
    private toastController: ToastController
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
    this.selectedDate = event.detail.value;
    console.log('Fecha seleccionada:', this.selectedDate);
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
