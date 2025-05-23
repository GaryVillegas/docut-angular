import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { StoreService } from '../store.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserStoreData } from '../types/store';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-store',
  templateUrl: './create-store.page.html',
  styleUrls: ['./create-store.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateStorePage {
  currentSlideIndex = 2;

  userStoreData: UserStoreData = {
    userUID: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
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
    private storeServ: StoreService,
    private auth: AngularFireAuth,
    private toast: ToastController,
    private cdRef: ChangeDetectorRef
  ) {}

  toggleCategory(category: string) {
    const index = this.userStoreData.storeInfo?.categories.indexOf(category);
    if (index > -1) {
      this.userStoreData.storeInfo?.categories.splice(index, 1);
    } else {
      this.userStoreData.storeInfo.categories.push(category);
    }
    this.cdRef.markForCheck();
  }

  isCategorySelected(category: string): boolean {
    return this.userStoreData.storeInfo.categories.includes(category);
  }

  nextSlide() {
    this.currentSlideIndex++;
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

    try {
      // Actualiza el tipo de usuario primero
      await this.storeServ.updateUserType(user.uid);

      // Establece el UID en los datos de la tienda
      this.userStoreData.userUID = user.uid;

      // Crea la tienda (elimina la condición innecesaria)
      await this.storeServ.createUserStore(
        user.uid,
        this.userStoreData.storeInfo
      );

      this.showToast('Éxito', 'Tienda creada correctamente.');
      this.router.navigate(['/tabs/home']);
    } catch (error) {
      console.error('Error al crear la tienda:', error);
      this.showAlert('Hubo un error al crear la tienda: ' + error);
    }
  }

  cancel() {
    this.router.navigate(['/register']);
  }

  async showToast(header: string, message: string) {
    const toast = await this.toast.create({
      header,
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
}
