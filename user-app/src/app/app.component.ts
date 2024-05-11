import {Component, ViewChild} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker} from "@angular/google-maps";
import {mark} from "@angular/compiler-cli/src/ngtsc/perf/src/clock";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  title = 'user-app';
  lat = 51.512802;
  lng = -0.091324;
  display: google.maps.LatLngLiteral | undefined;

  marker_a : google.maps.LatLngLiteral = {lat: 54.442961941307985, lng: 18.41293595279954}
  marker_b : google.maps.LatLngLiteral = {lat: 54.443307525498824, lng: 18.39841997140416}

  center : google.maps.LatLngLiteral = {
    lat : (this.marker_a.lat + this.marker_b.lat)/2,
    lng: (this.marker_a.lng + this.marker_b.lng)/2
  }
  vertices : google.maps.LatLngLiteral[] = [
    {lat : this.marker_a.lat, lng: this.marker_a.lng},
    {lat : this.marker_b.lat, lng: this.marker_b.lng}
  ]

  marker = {
    position: {
      lat: this.lat,
      lng: this.lng
    }
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow!.open(marker);
  }

  moveMap(event: google.maps.MapMouseEvent) {
    this.display = (event.latLng!.toJSON());
  }
}
