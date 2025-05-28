import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateStorePageRoutingModule } from './create-store-routing.module';

import { CreateStorePage } from './create-store.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateStorePageRoutingModule
  ],
  declarations: [CreateStorePage]
})
export class CreateStorePageModule {}
