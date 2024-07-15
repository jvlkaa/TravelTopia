import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RoutesViewComponent} from "./views/routes-view/routes-view.component";
import {CreateRouteViewComponent} from "./views/create-route-view/create-route-view.component";
import {AppComponent} from "./app.component";
import {MainViewComponent} from "./views/main-view/main-view.component";
import {RouteViewComponent} from "./views/route-view/route-view.component";

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
  },
  {
    component: RouteViewComponent,
    path: 'route/:name'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
