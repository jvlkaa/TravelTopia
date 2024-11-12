import {Component, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {Route} from "../../route/model/route";
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
import {UserService} from "../../user/service/user.service";
import {UserRoute} from "../../route/model/userRoute";
import * as turf from "@turf/turf";

@Component({
  selector: 'app-create-route-view',
  templateUrl: './create-route-view.component.html',
  styleUrls: ['./create-route-view.component.css']
})
export class CreateRouteViewComponent implements OnInit {
  private map!: Map;
  // map elements
  private route: { lat: number; lng: number }[] = [];
  private markerCenter: { lat: number; lng: number } | undefined;
  private pointsSource: VectorSource = new VectorSource();
  private pointsLayer: VectorLayer = new VectorLayer({
    source: this.pointsSource
  });
  private routeSource: VectorSource = new VectorSource();
  private routeLayer: VectorLayer = new VectorLayer({
    source: this.routeSource
  });

  public addRouteSuccess: string | null = null;
  // route properties - from route creator
  routeName: string = '';
  selectedType: string = '';
  selectedDifficulty: string = '';
  equipment: string = '';
  description: string = '';
  selectedHour: number = 0;
  selectedMinute: number  = 0;
  // set hours options to 0-20 and minutes to 0-59
  hours: number[] = Array.from({ length: 21 }, (_, i) => i);
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);


  constructor(public userService: UserService, private routeService: RouteService) {
  }

  ngOnInit() {
    this.route = [];
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
    this.map.addLayer(this.pointsLayer);
    //event - adding markers
    this.map.on('click', (event: MapBrowserEvent<any>) => {
      this.addMarkerToMap(event);
    });
  }

  /* calculating route distance */
  calculateDistance() {
    let distance = 0;
    for (let i = 1; i < this.route.length; i++) {
      const from = turf.point([this.route[i - 1].lng, this.route[i - 1].lat]);
      const to = turf.point([this.route[i].lng, this.route[i].lat]);
      const distanceSegment = turf.distance(from, to, { units: 'kilometers' });
      distance += distanceSegment;
    }
    return parseFloat(distance.toFixed(2));
  }

  /* calculating center of the map camera */
  calculateCenterMarker() {
    if (this.route!.length > 0) {
      this.markerCenter = this.route![Math.floor(this.route!.length / 2)];
    }
  }


  /* adding marker on the map in the place clicked by the user - to create custome route */
  addMarkerToMap(event: MapBrowserEvent<any>) {
    //add marker only if the route does not exist
    if (this.routeSource.getFeatures().length > 0) return;

    const coordinate = event.coordinate;
    const lonLat = toLonLat(coordinate);
    this.route.push({lat: lonLat[1], lng: lonLat[0]});

    const marker = new Feature({
      geometry: new Point(coordinate)
    });
    marker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '../assets/location-icon.png',
        scale: 0.05
      })
    }));

    this.pointsSource.addFeature(marker);
  }

  /* drawing route */
  drawButtonClicked() {
    this.routeSource.clear();
    if (this.route.length > 1) {
      //route
      const lineCoordinates = this.route.map(point => fromLonLat([point.lng, point.lat]));
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
      // start
      const markerA = new Feature({
        geometry: new Point(fromLonLat([this.route[0].lng, this.route[0].lat]))
      });
      markerA.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: '../assets/location-icon.png',
          scale: 0.05
        })
      }));
      this.routeSource.addFeature(markerA);
      // finish
      const markerB = new Feature({
        geometry: new Point(fromLonLat([this.route[this.route.length - 1].lng,
          this.route[this.route.length - 1].lat]))
      });
      markerB.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: '../assets/location-icon.png',
          scale: 0.05
        })
      }));
      this.routeSource.addFeature(markerB);
      //center of view
      this.calculateCenterMarker();
      const centerLonLat = fromLonLat([this.markerCenter!.lng, this.markerCenter!.lat]);
      this.map.getView().setCenter(centerLonLat);
      //changing layer
      this.map.removeLayer(this.pointsLayer);
      this.map.addLayer(this.routeLayer);
      //calculating route distance
      const distanceContent = document.getElementById('distance-value')!;
      distanceContent.innerHTML = this.calculateDistance().toFixed(2) + ' km';
      distanceContent.style.color = 'black';
      distanceContent.style.borderLeftStyle = 'solid';
      distanceContent.style.borderLeftWidth = 'thin';
    }
  }

  /* clearing the created route */
  clearButtonClicked() {
    this.route.splice(0, this.route.length);
    this.pointsSource.clear();
    this.routeSource.clear();
    this.map.removeLayer(this.routeLayer);
    this.map.addLayer(this.pointsLayer);

    const distanceContent = document.getElementById('distance-value')!;
    distanceContent.innerHTML = `utwórz najpierw trasę`;
    distanceContent.style.color = 'lightgray';
    distanceContent.style.borderLeftStyle = 'solid';
    distanceContent.style.borderLeftWidth = 'thin';
  }


  /* adding route to database - developers mode */
  addButtonClicked() {
    let time: number = Number(60 * this.selectedHour);
    time +=  Number(this.selectedMinute);
    if (this.route.length > 0 && this.routeName != '' && this.selectedType != '') {
      const idList: Route = {
        name: this.routeName,
        routePoints: [],
        userCreated: false,
        type: this.selectedType,
        equipment: this.equipment,
        difficulty: this.selectedDifficulty,
        description: this.description,
        time: time
      };
      for (let r of this.route) {
        const point: Point = {latitude: r.lat, longitude: r.lng};
        idList.routePoints.push(point);
        if (idList.routePoints.length == this.route.length) {
          this.routeService.addRoute(idList).subscribe({
            next: () => {
              this.addRouteSuccess = 'Dodano trase do bazy';
              setTimeout(() => {this.addRouteSuccess = null;}, 3000);
              this.routeName = '';
              this.description = '';
              this.equipment = '';
            },
            error: (err) => {
              this.addRouteSuccess = 'Wystąpił błąd';
              setTimeout(() => {this.addRouteSuccess = null;}, 3000);
            }
          });
        }
      }
    }
    else
      this.addRouteSuccess = 'Nie można dodać trasy do bazy. Upewnij się, że wszystkie wymagane pola są uzupełnione.';
    setTimeout(() => {this.addRouteSuccess = null;}, 3000);
  }

  /* adding route to database - to user favourites */
  addUserButtonClicked() {
    let time: number = Number(60 * this.selectedHour);
    time +=  Number(this.selectedMinute);
    if (this.route.length > 0 && this.routeName != '' && this.selectedType != '') {
      const idList: UserRoute = {
        name: this.routeName,
        routePoints: [],
        userCreated: true,
        type: this.selectedType,
        equipment: this.equipment,
        difficulty: this.selectedDifficulty,
        description: this.description,
        time: time,
        userIdToken: this.userService.socialUser!.idToken
      };
      for (let r of this.route) {
        const point: Point = {latitude: r.lat, longitude: r.lng};
        idList.routePoints.push(point);
        if (idList.routePoints.length == this.route.length) {
          this.userService.addRoute(idList).subscribe({
            next: () => {
              this.addRouteSuccess = 'Dodano trase do "Moje trasy"';
              setTimeout(() => {this.addRouteSuccess = null;}, 3000);
              this.routeName = '';
              this.description = '';
              this.equipment = '';
            },
            error: (err) => {
              this.addRouteSuccess = 'Wystąpił błąd';
              setTimeout(() => {this.addRouteSuccess = null;}, 3000);
            }
          });
        }
      }
    }
    else
      this.addRouteSuccess = 'Nie można dodać trasy do bazy. Upewnij się, że wszystkie wymagane pola są uzupełnione.';
     setTimeout(() => {this.addRouteSuccess = null;}, 3000);
  }
}

