import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, forkJoin, mergeMap, Observable, switchMap} from "rxjs";
import {RouteWithId} from "../../route/model/routeWithId";
import {RouteService} from "../../route/service/route.service";
import {SocialUser} from "@abacritt/angularx-social-login";
import {UserRoute} from "../../route/model/userRoute";
import {Trip} from "../../trip/model/trip";
import {TripService} from "../../trip/service/trip.service";
import {map} from "rxjs/operators";
import {Point} from "../../point/model/point";
import {RoutesFilter} from "../../route/model/routesFilter";
import {TripsFilter} from "../../trip/model/tripsFilter";
import {RouteListElement} from "../../route/model/routeListElement";
import {TripListElement} from "../../trip/model/tripListElement";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  socialUser!: SocialUser | null;

  isLoggedin: boolean = false;
  private loginStatusSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.isLoggedin);
  loginStatus$: Observable<boolean> = this.loginStatusSubject.asObservable();

  isDeveloper: boolean = false;
  private isDeveloperSubject = new BehaviorSubject<boolean>(false);
  isDeveloper$ = this.isDeveloperSubject.asObservable();

  constructor(private http: HttpClient, private routeSerivce: RouteService, private tripService: TripService) { }

  /* add user to database */
  addAccount(request: string): Observable<any>{
    const token: string = "\"" + request + "\"" ;
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post('TravelTopia/User/login',  token, {headers});
  }

  /* setter subscription */
  setLoginStatus(status: boolean): void {
    this.isLoggedin = status;
    this.loginStatusSubject.next(status);
  }

  setIsDeveloper(value: boolean) {
    this.isDeveloperSubject.next(value);
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

  /* get routes (id, name) from specific user */
  getRoutesListFromUser(user: string): Observable<RouteListElement[]> {
    return this.getRouteIdsFromUser(user).pipe(
      mergeMap((routesId: string[]) =>
        forkJoin(routesId.map(routeId => this.routeSerivce.getRouteListElementByID(routeId)))
      )
    );
  }

  /* get trip ids from specific user */
  getTripIdsFromUser(user: string): Observable<string[]>{
    return this.http.get<string[]>( 'TravelTopia/User/' + user + '/TripIds');
  }

  /* get trips from specific user */
  getTripsListFromUser(user: string): Observable<TripListElement[]> {
    return this.getTripIdsFromUser(user).pipe(
      mergeMap((tripsId: string[]) =>
        forkJoin(tripsId.map(tripId => this.tripService.getTripListElementByID(tripId)))
      )
    );
  }

  /* filtration of user routes */
  getUserFilteredRoutes(user: string, filter: RoutesFilter): Observable<RouteListElement[]> {
    const params = new HttpParams()
      .set('name', filter.name)
      .set('type', filter.type)
      .set('difficulty', filter.difficulty);

    return this.http.get<RouteListElement[]>('TravelTopia/User/' + user + '/routesFilter', { params })
  }

  /* filtration of user trips*/
  getUserFilteredTrips(user: string, filter: TripsFilter): Observable<TripListElement[]> {
    const params = new HttpParams()
        .set('name', filter.name)
        .set('difficulty', filter.difficulty);

    return this.http.get<TripListElement[]>('TravelTopia/User/' + user + '/tripsFilter', { params })
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

  /* delete route from user favourites */
  deleteRouteFromUser(userID: string, routeID: string): Observable<any> {
    const request = {
      user: userID,
      route: routeID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('TravelTopia/User/deleteRoute', request, { headers })
      .pipe(mergeMap(() => new Observable(observer => {
        observer.next('Pomyślnie usunięto trasę z ulubionych');
        observer.complete();
      })));
  }

  /* get user role (is developer) */
  getRole(): Observable<string> {
    return this.http.get<string>('TravelTopia/User/userRole/'+ this.socialUser?.idToken, { responseType: 'text' as 'json' });
  }

  /* add user trip to database */
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
            trip: tripID
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

  /* delete trip from user favourites */
  deleteTripFromUser(userID: string, tripID: string): Observable<any> {
    const request = {
      user: userID,
      trip: tripID
    };
    const headers = { 'Content-Type': 'application/json' };

    return this.http.post('TravelTopia/User/deleteTrip', request, { headers })
      .pipe(mergeMap(() => new Observable(observer => {
        observer.next('Pomyślnie usunięto wycieczkę z ulubionych');
        observer.complete();
      })));
  }

  /* get user trips near point*/
  getUserRoutesNearPoint(userID: string, point: Point): Observable<RouteWithId[]> {
    const lat = point.latitude;
    const lon = point.longitude;

    return this.getRouteIdsFromUser(userID).pipe(
      switchMap((routeIds: string[]) => {
        let params = new HttpParams();
        routeIds.forEach(route => {
          params = params.append('routes', route);
        });

        return this.http.get<RouteWithId[]>('TravelTopia/User' + '/NearUserPoint/' + lat + '/' + lon, { params });
      })
    );
  }
}
