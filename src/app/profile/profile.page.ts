import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { UserData, UserStoreData } from '../types/store';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  userData: UserData = {
    UID: '',
    userInfoData: {
      name: '',
      lastName: '',
      rut: '',
      tipe: '',
    },
  };

  userStoreData: UserStoreData = {
    userUID: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
    },
  };

  isClient = true;
  setDinamicClass = '';
  constructor(
    private authService: AuthService,
    private route: Router,
    private storeServ: StoreService
  ) {}

  ngOnInit() {
    this.canCreateStore();
  }

  onLogOut() {
    this.authService.logOut;
    this.route.navigate(['/']);
  }

  canCreateStore() {
    this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          if (!user?.uid) {
            return new Observable((subscriber) => subscriber.next(null));
          }

          return this.storeServ.getUserData(user.uid).pipe(
            switchMap((userData) => {
              this.userData = userData;
              console.log(userData);
              this.isClient = userData.userInfoData.tipe === 'cliente';

              // Si el usuario es un 'cliente'
              if (this.isClient) {
                this.storeServ
                  .getStoreByUID(user.uid)
                  .subscribe((storeData) => {
                    // Si el usuario ya tiene una tienda, esconder el botón
                    if (storeData.storeInfo.bussinessName) {
                      this.userStoreData = storeData;
                      console.log(storeData);
                      this.setDinamicClass = 'ion-hide';
                    } else {
                      this.setDinamicClass = ''; // Mostrar el botón si no tiene tienda
                    }
                  });
              } else {
                // Si el usuario NO es un 'cliente', siempre esconder el botón
                this.setDinamicClass = 'ion-hide';
              }
              return new Observable((subscriber) => subscriber.next(null));
            })
          );
        })
      )
      .subscribe({
        error: (error) => {
          console.error('error obteniendo datos: ', error);
        },
      });
  }

  onCreateStore() {
    this.route.navigate(['/create-store']);
  }
}
