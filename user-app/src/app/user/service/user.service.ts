import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  addAccount(request: string): Observable<any>{
    console.log(request);
    const token: string = "\"" + request + "\"" ;
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post('https://localhost:5269/TravelTopia/User/login',  token, {headers});
  }
}
