import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreServicePage } from './store-service.page';

const routes: Routes = [
  {
    path: '',
    component: StoreServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreServicePageRoutingModule {}
