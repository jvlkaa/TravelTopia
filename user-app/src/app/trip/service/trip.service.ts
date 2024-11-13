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

  addTrip(request: Trip): Observable<any>{
    return this.http.post('TravelTopia/Trip', request);
  }

  getTripsList(): Observable<TripListElement[]>{
    return this.http.get<TripListElement[]>( 'TravelTopia/Trip/list');
  }

  getTripByID(id: string): Observable<TripWithId>{
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/id/' + id)
  }

  getTrip(name: string): Observable<TripWithId>{
    return this.http.get<TripWithId>('TravelTopia/Trip' + '/' + name)
  }

  getFilteredTrips(filter: TripsFilter): Observable<TripListElement[]> {
    const params = new HttpParams()
        .set('name', filter.name)
        .set('difficulty', filter.difficulty);

    return this.http.get<TripListElement[]>('TravelTopia/Trip' + '/filter', { params })
  }
}
