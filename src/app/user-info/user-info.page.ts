import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';
import { userInfo } from '../types/user.type';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoPage {
  currentSlideIndex = 0;
  userInfo: userInfo = {
    tipe: 'cliente',
    name: '',
    lastName: '',
    rut: '',
  };

  slides = [{ id: '0' }, { id: '1' }];

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private storeService: StoreService,
    private toastController: ToastController
  ) {}

  nextSlide() {
    this.currentSlideIndex++;
  }

  prevSlide() {
    this.currentSlideIndex--;
    if (this.currentSlideIndex === 0) {
      this.router.navigate(['/login']);
    }
  }

  async handleSubmit() {
    const user = await this.auth.currentUser;
    if (!user) {
      this.showAlert('No hay un usuario autenticado.');
      return;
    }

    const UID = user.uid;

    try {
      await this.storeService.createUser(UID, this.userInfo);
      this.showToast(
        'Usuario creado exitosamente',
        'Bienvenido a la aplicación'
      );

      this.router.navigate(['/tabs/home']);
    } catch (err) {
      this.showAlert('Hubo un error al guardar la información del usuario.');
    }
  }

  formatRUT(event: any) {
    let value = event.target.value.replace(/[\.\-]/g, '');

    if (value.length > 1) {
      value = value.slice(0, -1) + '-' + value.slice(-1);
    }

    if (value.length > 5) {
      value = value.slice(0, 2) + '.' + value.slice(2);
    }

    if (value.length > 9) {
      value = value.slice(0, 6) + '.' + value.slice(6);
    }

    this.userInfo.rut = value;
  }

  cancel() {
    this.router.navigate(['/register']);
  }

  async showToast(header: string, message: string) {
    const toast = await this.toastController.create({
      header,
      message,
      duration: 3000,
      color: 'success',
      position: 'top',
    });
    await toast.present();
  }

  async showAlert(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
