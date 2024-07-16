import {PointService} from "../../point/service/point.service";
import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute} from "@angular/router";
import {RouteWithId} from "../../route/model/routeWithId";
import {AfterViewInit, Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-route-view',
  templateUrl: './route-view.component.html',
  styleUrls: ['./route-view.component.css']
})
export class RouteViewComponent implements OnInit {

  private view_route : RouteWithId | undefined;   //TO DO: add ngif in html file
  private map!: Map;
  private routeSource: VectorSource = new VectorSource();
  private routeLayer: VectorLayer = new VectorLayer({
    source: this.routeSource
  });
  private routeInfo: Overlay;
  private markerCenter: Point;
  private distance = 0;
  private time = 0;

  constructor(private pointService: PointService,
              private routeService: RouteService,
              private urlRoute: ActivatedRoute) {
  }

  setViewRoute(route: RouteWithId){
    this.view_route = route;
  }

  getViewRoute(){
    return this.view_route;
  }

  get routeExist(): boolean {
    return this.view_route !== undefined;
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
        //informacje o trasie
        const routePopupContainer = document.getElementById('popup')!;
        const routePopupCloser = document.getElementById('popup-closer')!;
        this.routeInfo = new Overlay({
          element: routePopupContainer,
        });
        this.map.addOverlay(this.routeInfo);
        routePopupCloser.onclick = () => {
          this.routeInfo.setPosition(undefined);
        };
        //event do wyswietlania informacji o trasie
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

  createMap(){
    if (!this.view_route) {
      return; // Poczekaj, aż dane zostaną załadowane
    }
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

  /* calculating travel time */
  calculateTime() {
    this.time = this.distance / 5 * 60;  //[minutes], simple conversion: average human speed is 5km/h
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
    this.calculateTime();
    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML = `<p>Distance: ${this.distance.toFixed(2)} km <br/>Time: ${this.time.toFixed(2)} min</p>`;
    this.routeInfo.setPosition(coordinate);
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
    // Start marker
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
    // End marker
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
    // Center map
    const centerPoint = this.view_route!.routePoints[Math.floor(this.view_route!.routePoints.length / 2)];
    this.map.getView().setCenter(fromLonLat([centerPoint.longitude, centerPoint.latitude]));
    this.map.addLayer(this.routeLayer);
  }

}
