import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateStorePage } from './create-store.page';

const routes: Routes = [
  {
    path: '',
    component: CreateStorePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateStorePageRoutingModule {}
