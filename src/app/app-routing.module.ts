import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'store',
    loadChildren: () =>
      import('./store/store.module').then((m) => m.StorePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'user-info',
    loadChildren: () =>
      import('./user-info/user-info.module').then((m) => m.UserInfoPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterPageModule),
  },  {
    path: 'create-store',
    loadChildren: () => import('./create-store/create-store.module').then( m => m.CreateStorePageModule)
  },
  {
    path: 'store-service',
    loadChildren: () => import('./store-service/store-service.module').then( m => m.StoreServicePageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
