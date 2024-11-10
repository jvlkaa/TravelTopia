import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Route} from "../model/route";
import {Routes} from "../model/routes";
import {RouteWithId} from "../model/routeWithId";
import {Point} from "../../point/model/point";
import {RoutesFilter} from "../model/routesFilter";
import {absoluteFromSourceFile} from "@angular/compiler-cli";

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

  getRoute(name: string): Observable<RouteWithId>{
    return this.http.get<RouteWithId>('TravelTopia/Route' + '/' + name)
  }

  getRoutesByString(text: string): Observable<RouteWithId[]>{
    return this.http.get<RouteWithId[]>('TravelTopia/Route' + '/' + text + '/list')
  }

  getFilteredRoutes(filter: RoutesFilter): Observable<RouteWithId[]>{
    const params = new HttpParams()
      .set('name', filter.name)
      .set('type', filter.type)
      .set('difficulty', filter.difficulty);

    return this.http.get<RouteWithId[]>('TravelTopia/Route' + '/filter', { params })
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
