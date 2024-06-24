import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Point} from "../model/point";
import {PointId} from "../model/pointId";

@Injectable({
  providedIn: 'root'
})
export class PointService {

  constructor(private http: HttpClient) { }

  addPoint(request: Point): Observable<any>{
  //apiUrl: 'http://localhost:5000/TravelTopia' // pozniej do pliku src/environments/environment.ts
    return this.http.post('https://localhost:5269/TravelTopia/Point', request);
  }

  getPoint(request: Point): Observable<PointId>{
    return this.http.get<PointId>('https://localhost:5269/TravelTopia/Point/'+request.latitude+'/'+request.longitude);
  }

}
