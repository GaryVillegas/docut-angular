import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loading = false;
  email = '';
  password = '';
  constructor(
    private route: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async handleLogin() {
    if (!this.email || !this.password) {
      this.presentToast(
        'Falta credenciales',
        'Por favor, complete todos los campos.'
      );
      return;
    }

    this.loading = true;
    try {
      await this.authService.authentication(this.email, this.password);
      console.log('login Correct');
      this.route.navigate(['/tabs/home']);
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/invalid-credential') {
        this.presentToast(
          'Error de credenciales',
          'Las credenciales proporcionadas son incorrectas o han expirado.'
        );
      } else if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password'
      ) {
        this.presentToast(
          'Error de inicio de sesión',
          'Correo o contraseña incorrectos.'
        );
      } else if (error.code === 'auth/user-not-found') {
        this.presentToast(
          'Usuario no encontrado',
          'No existe una cuenta con este correo.'
        );
      } else {
        this.presentToast('Error', 'Ocurrió un problema al iniciar sesión.');
      }
    } finally {
      this.loading = false;
    }
  }

  async googleLogin() {
    this.loading = true;
    try {
      await this.authService.loginWithGoogle();
      console.log('Se logue correctamente');
      setTimeout(() => {
        this.route.navigate(['/tabs/home']);
      }, 1500);
    } catch (error: any) {
      console.log(error);
      if (error.code === 'auth/popup-closed-by-user') {
        this.presentToast('Error', 'Ha cerrado la ventana de google.');
      } else {
        this.presentToast('Error', 'El inicio de sesión con Google fallo.');
      }
    } finally {
      this.loading = false;
    }
  }

  async presentToast(header: string, message: string) {
    const toast = await this.toastController.create({
      header: header,
      message: message,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  goToRegister() {
    this.route.navigate(['/register']);
  }
}
