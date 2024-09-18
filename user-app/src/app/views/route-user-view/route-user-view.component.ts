import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RouteWithId} from "../../route/model/routeWithId";
import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-route-user-view',
  templateUrl: './route-user-view.component.html',
  styleUrls: ['./route-user-view.component.css']
})
export class RouteUserViewComponent implements OnInit {

  private view_route : RouteWithId | undefined;   //TO DO: add ngif in html file
  private map!: Map;
  private routeSource: VectorSource = new VectorSource();
  private routeLayer: VectorLayer = new VectorLayer({
    source: this.routeSource,
    zIndex: 1
  });
  private routeInfo: Overlay;
  private markerCenter: Point;
  private distance = 0;
  public deleteRouteSuccess: string | null = null;
  // layer allows to see route "live"
  private satelliteLayer: TileLayer | null = null;
  private isSatelliteLayerVisible: boolean = false;

  constructor(private routeService: RouteService,
              private urlRoute: ActivatedRoute,
              private router: Router,
              public userService: UserService) {
  }

  setViewRoute(route: RouteWithId){
    this.view_route = route;
  }

  getViewRoute(){
    const route = this.view_route;
    if (this.view_route?.equipment === '')
      route!.equipment = 'brak';
    if (this.view_route?.description === '')
      route!.description = '-';
    return route;
  }

  getViewRouteTimeHours() :number {
    return Math.floor(this.view_route?.time! / 60);
  }

  getViewRouteTimeMinutes() :number {
    return this.view_route?.time! % 60;
  }

  ngOnInit() {
    this.urlRoute.params.subscribe(params => {
      this.routeService.getRoute(params['name']).subscribe((route : RouteWithId) => {
        this.setViewRoute(route);

        this.map = new Map({
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
          ],
          target: 'map',
          view: new View({
            center: fromLonLat([18.578207, 54.423506]),
            zoom: 10,
            maxZoom: 50,
          }),
        });
        //information about the route
        const routePopupContainer = document.getElementById('popup')!;
        const routePopupCloser = document.getElementById('popup-closer')!;
        this.routeInfo = new Overlay({
          element: routePopupContainer,
        });
        this.map.addOverlay(this.routeInfo);
        routePopupCloser.onclick = () => {
          this.routeInfo.setPosition(undefined);
        };
        //event - displaying information about the route
        this.map.on('singleclick', (event: MapBrowserEvent<any>) => {
          this.map.forEachFeatureAtPixel(event.pixel, (feature: any, layer: any) => {
            if (layer === this.routeLayer) {
              this.openInfoWindow(event.coordinate);
            }
          });
        });
        this.drawRouteFromDataBase();
      })
    });
  }

  /* calculating route distance */
  calculateDistance(route: Point[]) {
    this.distance = 0;
    for (let i = 1; i < route.length; i++) {
      this.distance = this.distance +
        Math.sqrt(
          Math.pow((route[i - 1].latitude - route[i].latitude), 2) +
          (Math.pow((route[i - 1].longitude - route[i].longitude), 2)))
        * 73;
    }
  }

  /* calculating center of the map camera */
  calculateCenterMarker() {
    if (this.view_route!.routePoints.length > 0) {
      this.markerCenter = this.view_route!.routePoints[Math.floor(this.view_route!.routePoints.length / 2)];
    }
  }

  /* showing information about the route */
  openInfoWindow(coordinate: number[]) {
    this.calculateCenterMarker()
    this.calculateDistance(this.view_route!.routePoints);
    // information about the distance and satellite vision
    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML =
      `<p>Distance: ${this.distance.toFixed(2)} km </p>
       <button id="picture-map" style="
        font-family: 'Calibri Light';
        font-weight: bold;
        width: 100%;
        border-bottom-right-radius: 20px;
        border-bottom-left-radius: 20px;
        background: lavender;
       "> Podgląd trasy </button>`;
    // closing popup
    const closeButton = document.getElementById('popup-closer')!;
    closeButton.onclick = () => { this.routeInfo.setPosition(undefined); };

    this.routeInfo.setPosition(coordinate);
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
      `<p>Distance: ${this.distance.toFixed(2)} km </p>
       <button id="picture-map" style="
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
        `<p>Distance: ${this.distance.toFixed(2)} km </p>
         <button id="picture-map" style="
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

  /* showing chosen route from list from database */
  drawRouteFromDataBase() {
    this.routeSource.clear();
    const lineCoordinates = this.view_route!.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
    const lineFeature = new Feature({
      geometry: new LineString(lineCoordinates)
    });
    lineFeature.setStyle(new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 4
      })
    }));
    this.routeSource.addFeature(lineFeature);
    // marker - starting point
    const startMarker = new Feature({
      geometry: new Point(fromLonLat([this.view_route!.routePoints[0].longitude, this.view_route!.routePoints[0].latitude]))
    });
    startMarker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '../assets/location-icon.png',
        scale: 0.05
      })
    }));
    this.routeSource.addFeature(startMarker);
    // marker - end point
    const endMarker = new Feature({
      geometry: new Point(fromLonLat(
        [this.view_route!.routePoints[this.view_route!.routePoints.length - 1].longitude,
          this.view_route!.routePoints[this.view_route!.routePoints.length - 1].latitude]))
    });
    endMarker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '../assets/location-icon.png',
        scale: 0.05
      })
    }));
    this.routeSource.addFeature(endMarker);
    // point setting center of the route
    const centerPoint = this.view_route!.routePoints[Math.floor(this.view_route!.routePoints.length / 2)];
    this.map.getView().setCenter(fromLonLat([centerPoint.longitude, centerPoint.latitude]));
    this.map.addLayer(this.routeLayer);
  }

  /* deleting route from users favourites */
  deleteButtonClicked(){
     this.userService.deleteRouteFromUser(this.userService.socialUser!.idToken, this.view_route!.id).subscribe({
      next: (message: string) => {
        this.deleteRouteSuccess = message;
        setTimeout(() => {
          this.deleteRouteSuccess = null;
          this.router.navigate(['routes/my-routes']);
          }, 3000);
      },
      error: (err: any) => {
        console.error('Nie udało się usunąć trasy z ulubionych', err);
      }
     });
  }
}
