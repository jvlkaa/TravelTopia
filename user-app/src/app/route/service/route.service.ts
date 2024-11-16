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

  /* add route */
  addRoute(request: Route): Observable<any>{
    return this.http.post('TravelTopia/Route', request);
  }

  /* get all routes */
  getRoutes(): Observable<RouteWithId[]>{
      return this.http.get<RouteWithId[]>( 'TravelTopia/Route');
  }

  /* get all routes (only id, name) */
  getRoutesList(): Observable<RouteListElement[]>{
    return this.http.get<RouteListElement[]>( 'TravelTopia/Route/list');
  }

  /* get route by name */
  getRoute(name: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/' + name)
  }

  /* filtration of routes (return only id, name) */
  getFilteredRoutes(filter: RoutesFilter): Observable<RouteListElement[]>{
    const params = new HttpParams()
      .set('name', filter.name)
      .set('type', filter.type)
      .set('difficulty', filter.difficulty);

    return this.http.get<RouteListElement[]>('TravelTopia/Route' + '/filter', { params })
  }

  /* get route by id */
  getRouteByID(id: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/id/' + id)
  }

  /* get route by id (only id and name) */
  getRouteListElementByID(id: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/list/id/' + id)
  }

  /* get routes near specific point */
  getRoutesNearPoint(point: Point): Observable<RouteWithId[]>{
    const lat = point.latitude;
    const lon = point.longitude;
    return this.http.get<RouteWithId[]>('TravelTopia/Route' + '/NearPoint/' + lat + '/' + lon)
  }
}
