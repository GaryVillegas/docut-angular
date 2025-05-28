import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  GoogleAuthProvider,
  Auth,
  browserLocalPersistence,
  setPersistence,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private authServ: AngularFireAuth, private auth: Auth) {}

  async authentication(email: string, password: string) {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      await this.authServ.signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('error al registrar cuenta: ', error);
      throw error;
    }
  }

  async registerAccount(email: string, password: string) {
    try {
      await this.authServ.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('error al crear cuenta: ', error);
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await this.authServ.signInWithPopup(provider);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }

  async logOut() {
    try {
      await this.authServ.signOut();
    } catch (error) {
      console.error('Error al cerrrar sesion: ', error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.authServ.authState;
  }
}
