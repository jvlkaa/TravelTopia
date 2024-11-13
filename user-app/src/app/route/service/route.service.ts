import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Route} from "../model/route";
import {RouteWithId} from "../model/routeWithId";
import {Point} from "../../point/model/point";
import {RoutesFilter} from "../model/routesFilter";
import {RouteListElement} from "../model/routeListElement";

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private http: HttpClient) { }

  addRoute(request: Route): Observable<any>{
    return this.http.post('TravelTopia/Route', request);
  }

  getRoutes(): Observable<RouteWithId[]>{
      return this.http.get<RouteWithId[]>( 'TravelTopia/Route');
  }

  getRoutesList(): Observable<RouteListElement[]>{
    return this.http.get<RouteListElement[]>( 'TravelTopia/Route/list');
  }

  getRoute(name: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/' + name)
  }

  getFilteredRoutes(filter: RoutesFilter): Observable<RouteListElement[]>{
    const params = new HttpParams()
      .set('name', filter.name)
      .set('type', filter.type)
      .set('difficulty', filter.difficulty);

    return this.http.get<RouteListElement[]>('TravelTopia/Route' + '/filter', { params })
  }

  getRouteByID(id: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/id/' + id)
  }

  getRoutesNearPoint(point: Point): Observable<RouteWithId[]>{
    const lat = point.latitude;
    const lon = point.longitude;
    return this.http.get<RouteWithId[]>('TravelTopia/Route' + '/NearPoint/' + lat + '/' + lon)
  }
}
