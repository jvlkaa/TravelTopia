import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, mergeMap, Observable} from "rxjs";
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

  getRoutesFromUser(user: string): Observable<RouteWithId[]> {
    return this.getRouteIdsFromUser(user).pipe(
      // Use 'mergeMap' to flatten the observable of route IDs
      mergeMap((routesId: string[]) =>
        // 'forkJoin' waits for all observables (getRouteByID) to complete
        forkJoin(routesId.map(routeId => this.routeSerivce.getRouteByID(routeId)))
      )
    );
  }

  /* filter user favourite routes */
  getRoutesFromUserByString(user: string, text: string): Observable<RouteWithId[]>{
    return this.http.get<RouteWithId[]>('https://localhost:5269/TravelTopia/Route' + '/' + user +'/' + text + '/list')
  }

  /* add route to user favourites*/
  addRouteToUser(userID: string, routeID: string): Observable<any>{
    const request = {
      user: userID,
      route: routeID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('https://localhost:5269/TravelTopia/User/addRoute',  request, {headers});
  }
}
