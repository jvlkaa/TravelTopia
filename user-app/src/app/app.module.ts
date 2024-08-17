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
import {ReactiveFormsModule} from "@angular/forms";
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
  GoogleLoginProvider,
  GoogleSigninButtonModule
} from "@abacritt/angularx-social-login";

@NgModule({
  declarations: [
    AppComponent,
    RoutesViewComponent,
    CreateRouteViewComponent,
    MainViewComponent,
    RouteViewComponent
  ],
  imports: [
    GoogleMapsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [
    PointService,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('594811329058-f3i591f9al5a22i3sbghck3mv4j0ia2h.apps.googleusercontent.com'),
          },
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
