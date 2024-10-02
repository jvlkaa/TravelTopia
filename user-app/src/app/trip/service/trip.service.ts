import { Injectable } from '@angular/core';
import {Trip} from "../model/trip";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private http: HttpClient) { }

  addTrip(request: Trip): Observable<any>{
    return this.http.post('https://localhost:5269/TravelTopia/Trip', request);
  }
}
