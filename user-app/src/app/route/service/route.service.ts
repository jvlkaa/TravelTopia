import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Route} from "../model/route";

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private http: HttpClient) { }

  addRoute(request: Route): Observable<any>{
    return this.http.post('https://localhost:5269/TravelTopia/Route', request);
  }
}
