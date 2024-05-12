import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker, MapPolyline} from "@angular/google-maps";
import {mark} from "@angular/compiler-cli/src/ngtsc/perf/src/clock";
import {GoogleMapsService} from "./service/google-maps.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit{
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

  ngOnInit() {
    this.route = [
      {lat: 54.41970652609283, lng: 18.58369819751392},
      {lat: 54.41884505188746, lng: 18.584856911808355},
      {lat: 54.41792113189437, lng: 18.58577959170948},
      {lat: 54.4171211355982, lng: 18.5840772647291},
      {lat: 54.41702032550608, lng: 18.583876943410086},
      {lat: 54.41675995966931, lng: 18.582303448826178},
      {lat: 54.41608571554169, lng: 18.582689686924322},
      {lat: 54.41571570028501, lng: 18.581152356393325},
      {lat: 54.41518670612146, lng: 18.579642697483404},
      {lat: 54.4150497990982, lng: 18.5790783345218},
      {lat: 54.41471492396176, lng: 18.579254383097958},
      {lat: 54.41438217457683, lng: 18.579648980386484},
      {lat: 54.41359112153057, lng: 18.577248090754818},
      {lat: 54.41321027038475, lng: 18.57740902329571},
      {lat: 54.41345376578749, lng: 18.578642839442562},
      {lat: 54.41354117404087, lng: 18.578760856639217},
      {lat: 54.413672286071524, lng: 18.579361671458553}
    ];
    this.markerA = this.route[0];
    this.markerB = this.route[this.route.length-1];
    this.center = {
      lat : (this.route[0].lat + this.route[this.route.length-1].lat)/2,
      lng: (this.route[0].lng + this.route[this.route.length-1].lng)/2
    }
    this.calculateCenterMarker();
    this.calculateDistance(this.route);
    this.calculateTime();
  }

  ngAfterViewInit() {
    if (this.mapPolyline && this.mapPolyline.polyline) {
      this.mapPolyline.polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (this.markerCenterEl) {
          this.markerCenterEl.position = this.markerCenter!; // ensure this is updated correctly
          this.openInfoWindow(this.markerCenterEl);
        }
      });
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
    this.markerCenter = this.route![Math.floor(this.route!.length/2)]
  }

  openInfoWindow(marker: MapMarker) {
    this.calculateCenterMarker()
    this.calculateDistance(this.route!);
    this.calculateTime();
    this.infoWindow!.open(marker);
  }

  moveMap(event: google.maps.MapMouseEvent) {
    this.display = (event.latLng!.toJSON());
  }
}
