import { Injectable } from '@angular/core';
import {Trip} from "../model/trip";
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {TripWithId} from "../model/tripWithId";
import {TripsFilter} from "../model/tripsFilter";
import {TripListElement} from "../model/tripListElement";

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private http: HttpClient) { }

  /* add trip */
  addTrip(request: Trip): Observable<any>{
    return this.http.post('TravelTopia/Trip', request);
  }

  /* get all trips (only id, name) */
  getTripsList(): Observable<TripListElement[]>{
    return this.http.get<TripListElement[]>( 'TravelTopia/Trip/list');
  }

  /* get trip by id (only id, name) */
  getTripListElementByID(id: string): Observable<TripListElement>{
    return this.http.get<TripListElement>('TravelTopia/Trip' + '/list/id/' + id)
  }

  /* get trip by name */
  getTripByName(name: string): Observable<TripWithId>{
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/' + name)
  }

  /* get trip by id */
  getTripById(id: String):Observable<TripWithId> {
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/id/' + id)
  }

  /* filtration of trips (return id, name) */
  getFilteredTrips(filter: TripsFilter): Observable<TripListElement[]> {
    const params = new HttpParams()
        .set('name', filter.name)
        .set('difficulty', filter.difficulty);
    return this.http.get<TripListElement[]>('TravelTopia/Trip' + '/filter', { params })
  }
}
