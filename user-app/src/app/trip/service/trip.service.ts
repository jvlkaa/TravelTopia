import { Injectable } from '@angular/core';
import {Trip} from "../model/trip";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TripWithId} from "../model/tripWithId";
import {RouteWithId} from "../../route/model/routeWithId";

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private http: HttpClient) { }

  addTrip(request: Trip): Observable<any>{
    return this.http.post('TravelTopia/Trip', request);
  }

  getTrips(): Observable<TripWithId[]>{
    return this.http.get<TripWithId[]>( 'TravelTopia/Trip');
  }

  getTripByID(id: string): Observable<TripWithId>{
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/id/' + id)
  }

  getTrip(name: string): Observable<TripWithId>{
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/' + name)
  }
}
