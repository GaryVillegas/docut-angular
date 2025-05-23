import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { AuthService } from '../auth.service';
import { UserStoreData } from '../types/store';
import { UserData } from '../types/user';
import { Animation, AnimationController } from '@ionic/angular';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
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

  fadeAnim: Animation;
  showStoreTab = false;
  isAdmin = false;
  constructor(
    private storeService: StoreService,
    private authService: AuthService,
    private animationCtrl: AnimationController
  ) {
    this.fadeAnim = this.animationCtrl
      .create()
      .addElement(document.querySelector('.store-tab') as any)
      .duration(500)
      .fromTo('opacity', '0', '1');
  }

  ngOnInit() {
    this.authService
      .getCurrentUser()
      .pipe(
        switchMap((user) => {
          if (!user?.uid)
            return new Observable((subscriber) => subscriber.next(null));

          return this.storeService.getUserData(user.uid).pipe(
            switchMap((userData) => {
              this.userData = userData;
              this.isAdmin = userData.userInfoData.tipe === 'administrador';

              if (this.isAdmin) {
                return this.storeService.getStoreByUID(user.uid).pipe(
                  map((storeData) => {
                    this.userStoreData = storeData;
                    this.showStoreTab = !!storeData?.storeInfo?.bussinessName;
                    if (this.showStoreTab) {
                      this.fadeAnim.play();
                    }
                    return storeData;
                  })
                );
              }
              return new Observable((subscriber) => subscriber.next(null));
            })
          );
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }

  shouldShowStoreTab(): boolean {
    return this.isAdmin && this.showStoreTab;
  }
}
