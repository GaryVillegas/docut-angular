import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private platform: Platform
  ) {
    if (this.platform.is('capacitor')) this.initPush();
  }

  ngOnInit() {
    this.auth.authState.subscribe((user) => {
      if (user) {
        console.log('User is logged in:', user);
        this.router.navigate(['/tabs/home']);
      } else {
        // User is logged out
        console.log('User is logged out');
        this.router.navigate(['/login']); // Navigate to login page
      }
    });
  }

  //FIXME: terminar notificaciones despues de terminar los demas modulos.
  initPush() {
    console.log('Initializing HomePage');

    //Request permission to use push notifications
    //IOS will prompt user and retuirn if they granted permission or not
    //Android will just grant without propting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        //Show some error
      }
    });

    //On success, we should be able to recive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, toke: ' + token.value);
    });

    //Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
