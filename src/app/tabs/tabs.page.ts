import { Component, OnInit } from '@angular/core';
import { StoreService } from '../store.service';
import { storeData } from '../types/store.type';
import { userData } from '../types/user.type';
import { Animation, AnimationController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  userData: userData = {
    UID: '',
    userInfo: {
      name: '',
      lastName: '',
      rut: '',
      tipe: '',
    },
  };

  userStoreData: storeData = {
    storeId: '',
    storeInfo: {
      bussinessName: '',
      direction: '',
      categories: [],
      userUID: '',
    },
  };

  fadeAnim: Animation;
  showStoreTab = false;
  isAdmin = false;
  constructor(
    private storeService: StoreService,
    private authService: Auth,
    private animationCtrl: AnimationController
  ) {
    this.fadeAnim = this.animationCtrl
      .create()
      .addElement(document.querySelector('.store-tab') as any)
      .duration(500)
      .fromTo('opacity', '0', '1');
  }

  async ngOnInit() {
    try {
      const user = await this.authService.currentUser;
      if (!user?.uid) return;

      const userData = await this.storeService.getUserData(user.uid);
      if (!userData) return;

      this.userData = userData;
      this.isAdmin = userData.userInfo.tipe === 'administrador';

      if (this.isAdmin) {
        const storeData = await this.storeService.getUserStore(user.uid);
        if (storeData && storeData.storeInfo?.bussinessName) {
          this.userStoreData = storeData;
          this.showStoreTab = true;
          this.fadeAnim.play();
        } else {
          this.showStoreTab = false;
        }
      } else {
        this.showStoreTab = false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  shouldShowStoreTab(): boolean {
    return this.isAdmin && this.showStoreTab;
  }
}
