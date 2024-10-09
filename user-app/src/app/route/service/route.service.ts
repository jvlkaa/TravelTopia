import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Route} from "../model/route";
import {Routes} from "../model/routes";
import {RouteWithId} from "../model/routeWithId";
import {Point} from "../../point/model/point";

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private http: HttpClient) { }

  addRoute(request: Route): Observable<any>{
    return this.http.post('https://localhost:5269/TravelTopia/Route', request);
  }

  getRoutes(): Observable<RouteWithId[]>{
      return this.http.get<RouteWithId[]>( 'https://localhost:5269/TravelTopia/Route');
  }

  getRoute(name: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('https://localhost:5269/TravelTopia/Route' + '/' + name)
  }

  getRoutesByString(text: string): Observable<RouteWithId[]>{
    return this.http.get<RouteWithId[]>('https://localhost:5269/TravelTopia/Route' + '/' + text + '/list')
  }

  getRouteByID(id: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('https://localhost:5269/TravelTopia/Route' + '/id/' + id)
  }

  getRoutesNearPoint(point: Point): Observable<RouteWithId[]>{
    const lat = point.latitude;
    const lon = point.longitude;
    return this.http.get<RouteWithId[]>('https://localhost:5269/TravelTopia/Route' + '/NearPoint/' + lat + '/' + lon)
  }

  // TO DO: uzueplnic gdy zostanie na backendzie dopisana funkcja
  // getUserRoutesNearPoint(point: Point): Observable<RouteWithId[]> {
  //   const lat = point.latitude;
  //   const lon = point.longitude;
  //   return
  // }
}
