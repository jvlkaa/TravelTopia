import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, mergeMap, Observable} from "rxjs";
import {RouteWithId} from "../../route/model/routeWithId";
import {RouteService} from "../../route/service/route.service";
import {SocialUser} from "@abacritt/angularx-social-login";
import {UserRoute} from "../../route/model/userRoute";

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

  /* get routes from specific user */
  getRoutesFromUser(user: string): Observable<RouteWithId[]> {
    return this.getRouteIdsFromUser(user).pipe(
      mergeMap((routesId: string[]) =>
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
    return this.getRouteIdsFromUser(userID).pipe(
      mergeMap((routeIds: string[]) => {
        if (!routeIds.includes(routeID)) {
          const request = {
            user: userID,
            route: routeID
          };
          const headers = { 'Content-Type': 'application/json' };

          return this.http.post('https://localhost:5269/TravelTopia/User/addRoute', request, { headers })
            .pipe(mergeMap(() => new Observable(observer => {
              observer.next('Dodano trasę do ulubionych');
              observer.complete();
            })));
        }
        else {
          return new Observable(observer => {
            observer.next('Trasa została już dodana do ulubionych');
            observer.complete();
          });
        }
      })
    );
  }

  /* add route created by user to database and to users favourites */
  addRoute(request: UserRoute): Observable<any>{
    return this.http.post('https://localhost:5269/TravelTopia/User/addNewRoute', request);
  }

  deleteRouteFromUser(userID: string, routeID: string): Observable<any> {
    const request = {
      user: userID,
      route: routeID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('https://localhost:5269/TravelTopia/User/deleteRoute', request, { headers })
      .pipe(mergeMap(() => new Observable(observer => {
        observer.next('Pomyślnie usunięto trase z ulubionych');
        observer.complete();
      })));
  }
}
