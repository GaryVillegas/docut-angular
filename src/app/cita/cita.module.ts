import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { CitaPageRoutingModule } from './cita-routing.module';

import { CitaPage } from './cita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CitaPageRoutingModule,
    HttpClientModule,
  ],
  declarations: [CitaPage],
})
export class CitaPageModule {}
