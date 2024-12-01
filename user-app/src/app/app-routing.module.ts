import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RoutesViewComponent} from "./views/routes-view/routes-view.component";
import {CreateRouteViewComponent} from "./views/create-route-view/create-route-view.component";
import {AppComponent} from "./app.component";
import {MainViewComponent} from "./views/main-view/main-view.component";
import {RouteViewComponent} from "./views/route-view/route-view.component";
import {RoutesUserViewComponent} from "./views/routes-user-view/routes-user-view.component";
import {ProfileViewComponent} from "./views/profile-view/profile-view.component";
import {CreateTripViewComponent} from "./views/create-trip-view/create-trip-view.component";
import {TripsViewComponent} from "./views/trips-view/trips-view.component";
import {TripViewComponent} from "./views/trip-view/trip-view.component";
import {TripsUserViewComponent} from "./views/trips-user-view/trips-user-view.component";

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
    path: 'routes'
  },
  {
    component: CreateRouteViewComponent,
    path: 'route/create'
  },
  {
    component: RouteViewComponent,
    path: 'route/:id'
  },
  {
    component: RoutesUserViewComponent,
    path: 'routes/my-routes'
  },
  {
    component: ProfileViewComponent,
    path: 'profile'
  },
  {
    component: CreateTripViewComponent,
    path: 'trip/create'
  },
  {
    component: TripsViewComponent,
    path: 'trips'
  },
  {
    component: TripViewComponent,
    path: 'trip/:id'
  },
  {
    component: TripsUserViewComponent,
    path: 'trips/my-trips'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
