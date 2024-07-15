import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleMapsModule } from '@angular/google-maps'
import {HttpClientModule} from "@angular/common/http";
import {PointService} from "./point/service/point.service";
import {FormsModule} from "@angular/forms";
import { RoutesViewComponent } from './views/routes-view/routes-view.component';
import { CreateRouteViewComponent } from './views/create-route-view/create-route-view.component';
import { MainViewComponent } from './views/main-view/main-view.component';
import { RouteViewComponent } from './views/route-view/route-view.component';

@NgModule({
  declarations: [
    AppComponent,
    RoutesViewComponent,
    CreateRouteViewComponent,
    MainViewComponent,
    RouteViewComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        GoogleMapsModule,
        HttpClientModule,
        FormsModule
    ],
  providers: [PointService],
  bootstrap: [AppComponent]
})
export class AppModule { }
