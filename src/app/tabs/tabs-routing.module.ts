import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./../home/home-routing.module').then(
            (m) => m.HomePageRoutingModule
          ),
      },
      {
        path: 'store',
        loadChildren: () =>
          import('./../store/store-routing.module').then(
            (m) => m.StorePageRoutingModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./../profile/profile-routing.module').then(
            (m) => m.ProfilePageRoutingModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
