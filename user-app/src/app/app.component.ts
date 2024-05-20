import {AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker, MapPolyline} from "@angular/google-maps";
import {mark} from "@angular/compiler-cli/src/ngtsc/perf/src/clock";
import {GoogleMapsService} from "./service/google-maps.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  @ViewChild(MapPolyline) mapPolyline: MapPolyline | undefined;
  @ViewChild('marker_center') markerCenterEl: MapMarker | undefined;
  title = 'user-app';
  display: google.maps.LatLngLiteral | undefined;
  route: google.maps.LatLngLiteral[] |undefined;
  center : google.maps.LatLngLiteral |undefined;
  markerA : google.maps.LatLngLiteral | undefined;
  markerB : google.maps.LatLngLiteral | undefined;
  markerCenter: google.maps.LatLngLiteral | undefined;
  distance = 0;
  time = 0;
  draw_path_button_clicked : boolean | undefined;
  path_markers_visibility : boolean | undefined;

  ngOnInit() {
    this.route = [];
    this.draw_path_button_clicked = false;
    this.path_markers_visibility = true;
  }

  ngAfterViewChecked() {
    // This will be called after every view check
    if (this.mapPolyline && this.mapPolyline.polyline) {
      this.mapPolyline.polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
        this.onPolylineClick();
      })
    }
  }
  onPolylineClick() {
    if (this.markerCenterEl && this.markerCenter) {
      this.markerCenterEl.position = this.markerCenter;
      this.openInfoWindow(this.markerCenterEl);
    }
  }

  calculateDistance(route: google.maps.LatLngLiteral[] ){
    this.distance = 0;
    for (let i = 1; i <route.length; i++) {
      this.distance = this.distance +
        Math.sqrt(
          Math.pow((route[i-1].lat - route[i].lat), 2) +
          (Math.pow((route[i-1].lng - route[i].lng), 2)))
          * 73;
    }
  }

  calculateTime(){
    this.time = this.distance/5*60;  //[minutes], simple conversion: average human speed is 5km/h
  }

  calculateCenterMarker(){
    if (this.route!.length > 0) {
      this.markerCenter = this.route![Math.floor(this.route!.length / 2)];
    }
  }

  openInfoWindow(marker: MapMarker) {
    this.calculateCenterMarker()
    this.calculateDistance(this.route!);
    this.calculateTime();
    if (this.infoWindow) {
      this.infoWindow.open(marker);
    }
  }

  moveMap(event: google.maps.MapMouseEvent) {
    this.display = (event.latLng!.toJSON());
  }

  addMarkerToMap(event: google.maps.MapMouseEvent){
    this.display = (event.latLng!.toJSON());
    this.route?.push(event.latLng!.toJSON());
  }

  drawButtonClicked(){
    this.draw_path_button_clicked = true;
    this.path_markers_visibility = false;
    if (this.route!.length > 0) {
      this.markerA = this.route![0];
      this.markerB = this.route![this.route!.length - 1];
      this.center = {
        lat: this.route!.reduce((acc, currVal) => acc + currVal.lat, 0) / this.route!.length,
        lng: this.route!.reduce((acc, currVal) => acc + currVal.lng, 0) / this.route!.length
      }
      this.calculateCenterMarker();
      this.calculateDistance(this.route!);
      this.calculateTime();
    }
  }

  clearButtonClicked(){
    this.route?.splice(0,this.route?.length);
    this.draw_path_button_clicked = false;
    this.path_markers_visibility = true;
  }
}
