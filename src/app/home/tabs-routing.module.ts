import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'home',
    component: TabsPage,
    children: [
      {
        path: 'friends',
        loadChildren: () => import('../friends/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'map',
        loadChildren: () => import('../map/tab2.module').then(m => m.Tab2PageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/tab3.module').then(m => m.Tab3PageModule)
      },
      {
        path: '',
        redirectTo: '/home/friends',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/friends',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
