import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RouteWithId} from "../../route/model/routeWithId";
import {RouteService} from "../../route/service/route.service";
import {SocialUser} from "@abacritt/angularx-social-login";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  socialUser!: SocialUser | null;
  isLoggedin?: boolean = false;

  constructor(private http: HttpClient, private routeSerivce: RouteService) { }

  /* add user to database */
  addAccount(request: string): Observable<any>{
    const token: string = "\"" + request + "\"" ;
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post('https://localhost:5269/TravelTopia/User/login',  token, {headers});
  }

  /* get route ids from specific user */
  getRouteIdsFromUser(user: string): Observable<string[]>{
    return this.http.get<string[]>( 'https://localhost:5269/TravelTopia/User/' + user + '/RouteIds');
  }

  /* user favourite routes */
  getRoutesFromUser(user: string): RouteWithId[]{
    let routesId: string[];
    let routesUser: RouteWithId[];
    this.getRouteIdsFromUser(user).subscribe((routes: string[]) => {
      routesId = routes;
      routesId.forEach((routeId) =>
        this.routeSerivce.getRouteByID(routeId).subscribe((route: RouteWithId) => {
          routesUser.push(route);
        })
      );
    });
    return routesUser!;
  }

  /* filter user favourite routes */
  getRoutesFromUserByString(user: string, text: string): Observable<RouteWithId[]>{
    return this.http.get<RouteWithId[]>('https://localhost:5269/TravelTopia/Route' + '/' + user +'/' + text + '/list')
  }

  /* add route to user favourites*/
  addRouteToUser(userID: string, routeID: string): Observable<any>{
    const request = {
      user: "\"" + userID + "\"" ,
      route: "\"" + routeID + "\""
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('https://localhost:5269/TravelTopia/User/addRoute',  request, {headers});
  }
}
