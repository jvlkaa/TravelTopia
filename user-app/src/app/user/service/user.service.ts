import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {forkJoin, mergeMap, Observable} from "rxjs";
import {RouteWithId} from "../../route/model/routeWithId";
import {RouteService} from "../../route/service/route.service";
import {SocialUser} from "@abacritt/angularx-social-login";
import {UserRoute} from "../../route/model/userRoute";
import {Trip} from "../../trip/model/trip";
import {TripWithId} from "../../trip/model/tripWithId";
import {TripService} from "../../trip/service/trip.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  socialUser!: SocialUser | null;
  isLoggedin: boolean = false;
  isDeveloper: boolean = false;

  constructor(private http: HttpClient, private routeSerivce: RouteService, private tripService: TripService) { }

  /* add user to database */
  addAccount(request: string): Observable<any>{
    const token: string = "\"" + request + "\"" ;
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post('TravelTopia/User/login',  token, {headers});
  }

  /* get route ids from specific user */
  getRouteIdsFromUser(user: string): Observable<string[]>{
    return this.http.get<string[]>( 'TravelTopia/User/' + user + '/RouteIds');
  }

  /* get routes from specific user */
  getRoutesFromUser(user: string): Observable<RouteWithId[]> {
    return this.getRouteIdsFromUser(user).pipe(
      mergeMap((routesId: string[]) =>
        forkJoin(routesId.map(routeId => this.routeSerivce.getRouteByID(routeId)))
      )
    );
  }

  /* get trip ids from specific user */
  getTripIdsFromUser(user: string): Observable<string[]>{
    return this.http.get<string[]>( 'TravelTopia/User/' + user + '/TripIds');
  }

  /* get trips from specific user */
  getTripsFromUser(user: string): Observable<TripWithId[]> {
    return this.getTripIdsFromUser(user).pipe(
      mergeMap((tripsId: string[]) =>
        forkJoin(tripsId.map(tripId => this.tripService.getTripByID(tripId)))
      )
    );
  }

  /* filter user favourite routes */
  getRoutesFromUserByString(user: string, text: string): Observable<RouteWithId[]>{
    return this.http.get<RouteWithId[]>('TravelTopia/Route' + '/' + user +'/' + text + '/list')
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

          return this.http.post('TravelTopia/User/addRoute', request, { headers })
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

  /* check if the route is in user favourites */
  isRouteInUserRoutes(userID: string, routeID: string): Observable<boolean> {
    return this.getRouteIdsFromUser(userID).pipe(
      map((routeIds: string[]) => {
        return routeIds.includes(routeID);
      })
    );
  }

  /* add route created by user to database and to users favourites */
  addRoute(request: UserRoute): Observable<any>{
    return this.http.post('TravelTopia/User/addNewRoute', request);
  }

  deleteRouteFromUser(userID: string, routeID: string): Observable<any> {
    const request = {
      user: userID,
      route: routeID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('TravelTopia/User/deleteRoute', request, { headers })
      .pipe(mergeMap(() => new Observable(observer => {
        observer.next('Pomyślnie usunięto trase z ulubionych');
        observer.complete();
      })));
  }

  getRole(): Observable<string> {
    return this.http.get<string>('TravelTopia/User/userRole/'+ this.socialUser?.idToken, { responseType: 'text' as 'json' });
  }


  addUserTrip(request: Trip): Observable<any>{
    return this.http.post('TravelTopia/User/addNewTrip', request);
  }

  /* add trip to user favourites*/
  addTripToUser(userID: string, tripID: string): Observable<any>{
    return this.getRouteIdsFromUser(userID).pipe(
      mergeMap((tripIds: string[]) => {
        if (!tripIds.includes(tripID)) {
          const request = {
            user: userID,
            route: tripID
          };
          const headers = { 'Content-Type': 'application/json' };

          return this.http.post('TravelTopia/User/addTrip', request, { headers })
            .pipe(mergeMap(() => new Observable(observer => {
              observer.next('Dodano wycieczkę do ulubionych');
              observer.complete();
            })));
        }
        else {
          return new Observable(observer => {
            observer.next('Wycieczka została już dodana do ulubionych');
            observer.complete();
          });
        }
      })
    );
  }

  deleteTripFromUser(userID: string, tripID: string): Observable<any> {
    const request = {
      user: userID,
      route: tripID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('TravelTopia/User/deleteTrip', request, { headers })
      .pipe(mergeMap(() => new Observable(observer => {
        observer.next('Pomyślnie usunięto wycieczkę z ulubionych');
        observer.complete();
      })));
  }

}
