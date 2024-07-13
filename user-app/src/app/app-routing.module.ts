import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RoutesViewComponent} from "./views/routes-view/routes-view.component";
import {CreateRouteViewComponent} from "./views/create-route-view/create-route-view.component";
import {AppComponent} from "./app.component";
import {MainViewComponent} from "./views/main-view/main-view.component";

const routes: Routes = [
  { path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  {
    component: MainViewComponent,
    path: 'main'
  },
  {
    component: RoutesViewComponent,
    path: 'route'
  },
  {
    component: CreateRouteViewComponent,
    path: 'route/create'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
