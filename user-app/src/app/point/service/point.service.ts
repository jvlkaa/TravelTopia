import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Point} from "../model/point";

@Injectable({
  providedIn: 'root'
})
export class PointService {

  constructor(private http: HttpClient) { }

  addPoint(request: Point): Observable<any>{
    return this.http.post('/TravelTopia/Point', request);
  }

}
