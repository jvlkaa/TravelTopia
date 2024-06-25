import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleMapsModule } from '@angular/google-maps'
import {HttpClientModule} from "@angular/common/http";
import {PointService} from "./point/service/point.service";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent
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
