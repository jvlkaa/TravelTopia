import {Component, OnInit} from '@angular/core';
import {PointService} from "../../point/service/point.service";
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
// @ts-ignore
import Overlay from 'ol/Overlay';
import {UserService} from "../../user/service/user.service";

@Component({
  selector: 'app-create-route-view',
  templateUrl: './create-route-view.component.html',
  styleUrls: ['./create-route-view.component.css']
})
export class CreateRouteViewComponent implements OnInit {
  private map!: Map;
  private coordinates: { lat: number; lng: number } | undefined;
  private route: { lat: number; lng: number }[] = [];
  private markerCenter: { lat: number; lng: number } | undefined;
  private distance = 0;
  private time = 0;
  private pointsSource: VectorSource = new VectorSource();
  private pointsLayer: VectorLayer = new VectorLayer({
    source: this.pointsSource
  });
  private routeSource: VectorSource = new VectorSource();
  private routeLayer: VectorLayer = new VectorLayer({
    source: this.routeSource
  });
  private routeInfo: Overlay;

  public addRouteSuccess: string | null = null;
  public routeName: string = '';
  selectedType: string = '';

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
    //event dodawania markerow
    this.map.on('click', (event: MapBrowserEvent<any>) => {
      this.moveMap(event);
      this.addMarkerToMap(event);
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
  }

  /* calculating route distance */
  calculateDistance(route: google.maps.LatLngLiteral[]) {
    this.distance = 0;
    for (let i = 1; i < route.length; i++) {
      this.distance = this.distance +
        Math.sqrt(
          Math.pow((route[i - 1].lat - route[i].lat), 2) +
          (Math.pow((route[i - 1].lng - route[i].lng), 2)))
        * 73;
    }
  }

  /* calculating travel time */
  calculateTime() {
    this.time = this.distance / 5 * 60;  //[minutes], simple conversion: average human speed is 5km/h
  }

  /* calculating center of the map camera */
  calculateCenterMarker() {
    if (this.route!.length > 0) {
      this.markerCenter = this.route![Math.floor(this.route!.length / 2)];
    }
  }

  /* showing information about the route */
  openInfoWindow(coordinate: number[]) {
    this.calculateCenterMarker()
    this.calculateDistance(this.route!);
    this.calculateTime();
    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML = `<p>Distance: ${this.distance.toFixed(2)} km <br/>Time: ${this.time.toFixed(2)} min</p>`;
    this.routeInfo.setPosition(coordinate);
  }

  /* showing the location of clicked place on the map */
  moveMap(event: MapBrowserEvent<any>) {
    const lonLat = toLonLat(event.coordinate);
    this.coordinates = {
      lat: lonLat[1],
      lng: lonLat[0]
    };
  }

  /* adding marker on the map in the place clicked by the user - to create custome route */
  addMarkerToMap(event: MapBrowserEvent<any>) {
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
      //finish
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
    }
  }

  /* clearing the created route */
  clearButtonClicked() {
    this.route.splice(0, this.route.length);
    this.pointsSource.clear();
    this.routeSource.clear();
    this.map.removeLayer(this.routeLayer);
    this.map.addLayer(this.pointsLayer);

    const popupContent = document.getElementById('popup-content')!;
    popupContent.innerHTML = ``;
  }

  getCoordinates() {
    return this.coordinates;
  }

  /* adding route to favourites */
  addToFavourites(){
//zmienic view_route na ta dodana trase
//     this.userService.addRouteToUser(this.userService.socialUser!.idToken, this.view_route!.id).subscribe({
//       next: (message: string) => {
//         this.addRouteSuccess = message;
//         setTimeout(() => {this.addRouteSuccess = null;}, 3000);
//       },
//       error: (err: any) => {
//         console.error('Nie udało się dodać trasy do ulubionych', err);
//       }
//     });
  }

  /* adding route to database - to user favourites */
  addButtonClicked() {
    if (this.route.length > 0 && this.routeName != '' && this.selectedType != '') {
      const idList: Route = {
        name: this.routeName,
        routePoints: [],
        userCreated: true,
        type: this.selectedType
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
            },
            error: (err) => {
              this.addRouteSuccess = 'Wystąpił błąd';
              setTimeout(() => {this.addRouteSuccess = null;}, 3000);
            }
          });
        }
      }
      //addToFavourites();
    }
    else
      this.addRouteSuccess = 'Nie można dodać trasy do bazy. Upewnij się, że wszystkie pola są uzupełnione.';
     setTimeout(() => {this.addRouteSuccess = null;}, 3000);
  }
}

