import {Component, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute} from "@angular/router";
import * as turf from '@turf/turf';
import {UserService} from "../../user/service/user.service";
import {TripWithId} from "../../trip/model/tripWithId";
import {TripService} from "../../trip/service/trip.service";
import {RouteWithId} from "../../route/model/routeWithId";
import {catchError, forkJoin, Observable, of, switchMap} from "rxjs";
import { map } from 'rxjs/operators';
import {Location} from '@angular/common';
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
// @ts-ignore
import { boundingExtent } from 'ol/extent';

@Component({
  selector: 'app-trip-view',
  templateUrl: './trip-view.component.html',
  styleUrls: ['./trip-view.component.css']
})
export class TripViewComponent implements OnInit{
  private map!: Map;
  // presenting trip and its routes
  public view_trip : TripWithId | undefined;
  public  routes: RouteWithId[] = [];

  // map elements
  private popupSatellite: Overlay;
  private tripSource: VectorSource = new VectorSource();
  private tripLayer: VectorLayer = new VectorLayer({
    source: this.tripSource,
    zIndex: 1
  });
  // layer allows to see route "live"
  private satelliteLayer: TileLayer | null = null;
  private isSatelliteLayerVisible: boolean = false;
  public operationSuccess: string | null = null;

  // add/delete button for the user
  public isFavourite$: Observable<boolean> | null = null;

  constructor(private routeService: RouteService, private tripService: TripService,
              private urlRoute: ActivatedRoute,
              public userService: UserService,
              private location: Location) {
  }

  setViewTrip(trip: TripWithId){
    this.view_trip = trip;
  }

  ngOnInit() {
    // getting trip, setting  map and events
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
            zoom: 18,
            maxZoom: 50,
          }),
        });
        //satellite
        const routePopupContainer = document.getElementById('popup')!;
        const routePopupCloser = document.getElementById('popup-closer')!;
        this.popupSatellite = new Overlay({
          element: routePopupContainer,
        });
        this.map.addOverlay(this.popupSatellite);
        routePopupCloser.onclick = () => {
          this.popupSatellite.setPosition(undefined);
        };
        //event - displaying popup
        this.map.on('singleclick', (event: MapBrowserEvent<any>) => {
          this.map.forEachFeatureAtPixel(event.pixel, (feature: any, layer: any) => {
            if (layer === this.tripLayer) {
              this.openInfoWindow(event.coordinate);
            }
          });
        });

        this.generateTrip();
      })
    });
  }

  /* calculating center of the trip camera map */
  calculateCenterMarker() {
    let routesPoints: Point[] = [];
    this.routes.forEach(async (r) => {
      r.routePoints.forEach(async (point) =>{
        routesPoints.push(point);
      })
    });
    const centerPoint = routesPoints[Math.floor(routesPoints.length / 2)];
    this.map.getView().setCenter(fromLonLat([centerPoint.longitude, centerPoint.latitude]));
    this.map.addLayer(this.tripLayer);
  }

  /* sattelite vision */
  openInfoWindow(coordinate: number[]) {
    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML =
      `<button id="picture-map" style="
           font-family: 'Calibri Light';
           font-weight: bold;
           width: 100%;
           border-bottom-right-radius: 20px;
           border-bottom-left-radius: 20px;
           background: lavender;
       "> Podgląd trasy </button>`;
    // closing popup
    const closeButton = document.getElementById('popup-closer')!;
    closeButton.onclick = () => { this.popupSatellite.setPosition(undefined); };

    this.popupSatellite.setPosition(coordinate);
    const pictureButton = document.getElementById('picture-map')!;
    pictureButton.onclick = () => { this.displaySatelliteLayer(); };
  }

  /* showing "live" fragment of the route using ESRI World Imagery (satellite layer)*/
  displaySatelliteLayer(){
    this.satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      }),
      zIndex: 0
    });
    this.map.addLayer(this.satelliteLayer);

    // update button text - to remove layer
    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML =
      `<button id="picture-map" style="
          font-family: 'Calibri Light';
          font-weight: bold;
          width: 100%;
          border-bottom-right-radius: 20px;
          border-bottom-left-radius: 20px;
          background: lavender;
       "> Zamknij podgląd </button>`;
    this.isSatelliteLayerVisible = true;

    // update button onlick
    const pictureButton = document.getElementById('picture-map')!;
    pictureButton.onclick = () => { this.removeSatelliteLayer(); };
    const closeButton = document.getElementById('popup-closer')!;
    closeButton.style.display = 'none';
  }

  /* removing satellite layer - (showing fragment of the route using ESRI World Imagery) */
  removeSatelliteLayer() {
    if (this.satelliteLayer) {
      this.map.removeLayer(this.satelliteLayer);
      this.satelliteLayer = null;

      // update button text - to show satellite layer
      const popupContent = document.getElementById('popup-content')!;
      popupContent.innerHTML =
        `<button id="picture-map" style="
           font-family: 'Calibri Light';
           font-weight: bold;
           width: 100%;
           border-bottom-right-radius: 20px;
           border-bottom-left-radius: 20px;
           background: lavender;
         "> Podgląd trasy </button>`;
      this.isSatelliteLayerVisible = false;

      // update button onlick
      const pictureButton = document.getElementById('picture-map')!;
      pictureButton.onclick = () => {this.displaySatelliteLayer();};
      const closeButton = document.getElementById('popup-closer')!;
      closeButton.style.display = 'inline';
    }
  }

  /* get routes from the trip */
  generateTrip(){
    // get routes from trip
    const tripRoutes = this.view_trip!.routes.map(routeId =>
      this.routeService.getRouteByID(routeId)
    );

    forkJoin(tripRoutes).pipe(
        switchMap((tripRoutes: RouteWithId[]) => {
          this.routes = tripRoutes;
          this.generateTripOnMap();
          if (this.userService.isLoggedin) {
            return this.checkUserFavourites();
          }
          return [];
        }),
        catchError(error => {
          console.error(error);
          return of(false);
        })
    ).subscribe(favourites => {
      this.isFavourite$ = of(favourites);
    });

  }

  /* generate random color for route color */
  generateRouteColor(): string {
    const colors : string = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += colors[Math.floor(Math.random() * colors.length)];
    }
    return color;
  }

  /* drawing marker on the map */
  drawMarker(point: Point){
    const marker= new Feature({
      geometry: point
    });
    marker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '../assets/location-icon.png',
        scale: 0.05
      })
    }));
    this.tripSource.addFeature(marker);
  }

  /* drawing route on the map */
  drawRoute(route: RouteWithId){
    let color = this.generateRouteColor();
    const lineCoordinates = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
    const lineFeature = new Feature({
      geometry: new LineString(lineCoordinates)
    });
    lineFeature.setStyle(new Style({
      stroke: new Stroke({
        color: color,
        width: 4
      })
    }));
    // markers: start and finish
    this.drawMarker(new Point(fromLonLat([route.routePoints[0].longitude, route.routePoints[0].latitude])));
    this.drawMarker(new Point(fromLonLat([route.routePoints[route.routePoints.length - 1].longitude, route.routePoints[route.routePoints.length - 1].latitude])));
    this.tripSource.addFeature(lineFeature);
  }

  /* calculating zoom map */
  calculateZoom() {
    let coordinates: number[][] = [];
    this.routes.forEach(route => {
      const points = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
      coordinates = coordinates.concat(points);
    });

    const extent = boundingExtent(coordinates);
    this.map.getView().fit(extent, {
      size: this.map.getSize(),
      maxZoom: 16,
      padding: [200, 200, 200, 200]
    });
  }

  /* showing chosen trip from list from database */
  generateTripOnMap() {
    this.tripSource.clear();
    //center and zoom
    this.calculateZoom();
    this.calculateCenterMarker();
    //draw each route
    this.routes.forEach(async (r) => {
        this.drawRoute(r);
    });
  }

  /* adding trip to favourites */
  addButtonClicked(){
    this.userService.addTripToUser(this.userService.socialUser!.idToken, this.view_trip!.id).subscribe({
      next: (message: string) => {
        this.operationSuccess = message;
        setTimeout(() => {
          this.operationSuccess = null;
          if(this.userService.isLoggedin)
            this.isFavourite$ = this.checkUserFavourites();
        }, 3000);
      },
      error: (err: any) => {
        console.error('Nie udało się dodać wycieczki do ulubionych', err);
      }
    });
  }

  /* deleting trip from favourites */
  deleteButtonClicked(){
    this.userService.deleteTripFromUser(this.userService.socialUser!.idToken, this.view_trip!.id).subscribe({
      next: (message: string) => {
        this.operationSuccess = message;
        setTimeout(() => {
          this.operationSuccess = null;
          this.location.back();
        }, 3000);
      },
      error: (err: any) => {
        console.error('Nie udało się usunąć wycieczki z ulubionych', err);
      }
    });
  }

  /* checking if the trip is in user favourites */
  checkUserFavourites(): Observable<boolean> {
    return this.userService.getTripIdsFromUser(this.userService.socialUser!.idToken!).pipe(
      map(trips => trips.includes(this.view_trip?.id!))
    );
  }

  /* calculating route distance */
  calculateDistance(): number {
    let distance = 0;
    for (let r of this.routes) {
      for (let i = 1; i < r.routePoints.length; i++) {
        const start = turf.point([r.routePoints[i - 1].longitude, r.routePoints[i - 1].latitude]);
        const finish = turf.point([r.routePoints[i].longitude, r.routePoints[i].latitude]);
        const distancePart = turf.distance(start, finish, { units: 'kilometers' });
        distance += distancePart;
      }
    }
    return parseFloat(distance.toFixed(2));
  }
}
