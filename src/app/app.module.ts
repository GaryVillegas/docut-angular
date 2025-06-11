import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'docut-50409',
        appId: '1:700839134495:web:19c0203a6b49491ad89c2a',
        storageBucket: 'docut-50409.firebasestorage.app',
        apiKey: 'AIzaSyDBrdyCJjBUJawut98qx-daMgDJ45sEWT8',
        authDomain: 'docut-50409.firebaseapp.com',
        messagingSenderId: '700839134495',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    InAppBrowser,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
