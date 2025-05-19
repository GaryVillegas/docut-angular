import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { StoreService } from '../store.service';
import { ToastController } from '@ionic/angular';

interface UserInfoType {
  tipe: string;
  name: string;
  lastName: string;
  rut: string;
}

interface userStore {
  bussinessName: string;
  direction: string;
  categories: string[];
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoPage {
  currentSlideIndex = 0;
  userInfo: UserInfoType = {
    tipe: 'cliente',
    name: '',
    lastName: '',
    rut: '',
  };
  storeInfo: userStore = {
    bussinessName: '',
    direction: '',
    categories: [],
  };

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

  slides = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private storeService: StoreService,
    private toastController: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  selectUserType(type: string) {
    this.userInfo.tipe = type;
    this.cdRef.markForCheck();
  }

  toggleCategory(category: string) {
    const index = this.storeInfo.categories.indexOf(category);
    if (index > -1) {
      this.storeInfo.categories.splice(index, 1);
    } else {
      this.storeInfo.categories.push(category);
    }
    this.cdRef.markForCheck();
  }

  isCategorySelected(category: string): boolean {
    return this.storeInfo.categories.includes(category);
  }

  nextSlide() {
    if (this.userInfo.tipe === 'cliente' && this.currentSlideIndex === 1) {
      this.currentSlideIndex = 4;
    } else {
      this.currentSlideIndex++;
    }
  }

  prevSlide() {
    this.currentSlideIndex--;
  }

  async handleSubmit() {
    const user = await this.auth.currentUser;
    if (!user) {
      this.showAlert('No hay un usuario autenticado.');
      return;
    }

    const UID = user.uid;

    try {
      await this.storeService.createUserInfo(UID, this.userInfo);
      this.showToast(
        'Usuario creado exitosamente',
        'Bienvenido a la aplicación'
      );

      if (this.userInfo.tipe === 'administrador') {
        await this.storeService.createUserStore(UID, this.storeInfo);
      }

      this.router.navigate(['/tabs/home']);
    } catch (err) {
      this.showAlert('Hubo un error al guardar la información del usuario.');
    }
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
