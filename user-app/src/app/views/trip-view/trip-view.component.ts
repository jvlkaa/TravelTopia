import {Component, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute} from "@angular/router";
// @ts-ignore
import Map from 'ol/Map';
// @ts-ignore
import View from 'ol/View';
// @ts-ignore
import { OSM } from 'ol/source';
// @ts-ignore
import VectorLayer from 'ol/layer/Vector';
// @ts-ignore
import VectorSource from 'ol/source/Vector';
// @ts-ignore
import Feature from 'ol/Feature';
// @ts-ignore
import { Point, LineString } from 'ol/geom';
// @ts-ignore
import { fromLonLat, toLonLat  } from 'ol/proj';
// @ts-ignore
import TileLayer from 'ol/layer/Tile';
// @ts-ignore
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
// @ts-ignore
import { MapBrowserEvent } from 'ol';
// @ts-ignore
import Overlay from 'ol/Overlay';
// @ts-ignore
import XYZ from 'ol/source/XYZ';
import {UserService} from "../../user/service/user.service";
import {TripWithId} from "../../trip/model/tripWithId";
import {TripService} from "../../trip/service/trip.service";
import {RouteWithId} from "../../route/model/routeWithId";

@Component({
  selector: 'app-trip-view',
  templateUrl: './trip-view.component.html',
  styleUrls: ['./trip-view.component.css']
})
export class TripViewComponent implements OnInit{
  private view_trip : TripWithId | undefined;   //TO DO: add ngif in html file
  private map!: Map;
  private tripSource: VectorSource = new VectorSource();
  private tripLayer: VectorLayer = new VectorLayer({
    source: this.tripSource,
    zIndex: 1
  });
  private markerCenterPopup: Point;
  private distance = 0;
  public addTripSuccess: string | null = null;

  constructor(private routeService: RouteService, private tripService: TripService,
              private urlRoute: ActivatedRoute,
              public userService: UserService) {
  }

  setViewTrip(trip: TripWithId){
    this.view_trip = trip;
  }

  getViewTrip(){
    const trip = this.view_trip;
    if (this.view_trip?.description === '')
      trip!.description = '-';
    return trip;
  }


  ngOnInit() {
    this.urlRoute.params.subscribe(params => {
      this.tripService.getTrip(params['name']).subscribe((trip : TripWithId) => {
        this.setViewTrip(trip);

        this.map = new Map({
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          target: 'map',
          view: new View({
            center: fromLonLat([18.578207, 54.423506]), // from calculateCenterMarker()
            zoom: 10,
            maxZoom: 50,
          }),
        });
        this.drawTripFromDataBase();
      })
    });
  }

  // TO DO:
  /* calculating center of the popup camera map */
  calculateCenterMarkerPopup() {

  }

  // TO DO:
  /* calculating center of the trip camera map */
  calculateCenterMarker() {

  }

  // TO DO: calculating distanse from all routes
  calculateDistance(){

  }

  // TO DO:
  /* showing information about the trip */
  // openInfoWindow(coordinate: number[]) {
  //   this.calculateCenterMarkerPopup()
  // }

  // TO DO:
  /* showing chosen trip from list from database */
  drawTripFromDataBase() {
    this.tripSource.clear();


    // point setting center of the trip
    // const centerPoint = this.view_trip!.routePoints[Math.floor(this.view_trip!.routePoints.length / 2)];
    // this.map.getView().setCenter(fromLonLat([centerPoint.longitude, centerPoint.latitude]));
    // this.calculateDistance();
    this.map.addLayer(this.tripLayer);
  }

  /* adding trip to favourites */
  addButtonClicked(){
    this.userService.addTripToUser(this.userService.socialUser!.idToken, this.view_trip!.id).subscribe({
      next: (message: string) => {
        this.addTripSuccess = message;
        setTimeout(() => {this.addTripSuccess = null;}, 3000);
      },
      error: (err: any) => {
        console.error('Nie udało się dodać wycieczki do ulubionych', err);
      }
    });
  }
}
