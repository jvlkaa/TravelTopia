import {Injectable, NgZone} from '@angular/core';
import {Observable} from "rxjs";

export interface MapDirectionsResponse {
  status: google.maps.DirectionsStatus;
  result?: google.maps.DirectionsResult;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private _directionsService: google.maps.DirectionsService | undefined;

  constructor(private readonly _ngZone: NgZone) {}

  route(request: google.maps.DirectionsRequest): Observable<MapDirectionsResponse> {
    return new Observable(observer => {
      this._getService().then(service => {
        service.route(request, (result, status) => {
          this._ngZone.run(() => {
            observer.next({result: result || undefined, status});
            observer.complete();
          });
        });
      });
    });
  }

  private _getService(): Promise<google.maps.DirectionsService> {
    if (!this._directionsService) {
      if (google.maps.DirectionsService) {
        this._directionsService = new google.maps.DirectionsService();
      } else {
        return google.maps.importLibrary('routes').then(lib => {
          this._directionsService = new (lib as google.maps.RoutesLibrary).DirectionsService();
          return this._directionsService;
        });
      }
    }

    return Promise.resolve(this._directionsService);
  }
}
