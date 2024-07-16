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
import {PointService} from "./point/service/point.service";
import {RouteService} from "./route/service/route.service";
import {Route} from "./route/model/route";
import {PointId} from "./point/model/pointId";
import {Routes} from "./route/model/routes";
import {RouteWithId} from "./route/model/routeWithId";

/* functions for future use - do not remove */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
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

  public routes: RouteWithId[] = [];

  constructor(private pointService: PointService, private routeService: RouteService) {
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
    // //informacje o trasie
    // const routePopupContainer = document.getElementById('popup')!;
    // const routePopupCloser = document.getElementById('popup-closer')!;
    // this.routeInfo = new Overlay({
    //   element: routePopupContainer,
    // });
    // this.map.addOverlay(this.routeInfo);
    // routePopupCloser.onclick = () => {
    //   this.routeInfo.setPosition(undefined);
    // };
    // //event do wyswietlania informacji o trasie
    // this.map.on('singleclick', (event: MapBrowserEvent<any>) => {
    //   this.map.forEachFeatureAtPixel(event.pixel, (feature: any, layer: any) => {
    //     if (layer === this.routeLayer) {
    //       this.openInfoWindow(event.coordinate);
    //     }
    //   });
    // });
    this.listRoutes();
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

  /* adding points and route to database */
  addButtonClicked() {
    if (this.route.length > 0 && this.routeName != '') {
      const idList: Route = {
        name: this.routeName,
        routePoints: []
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
              this.listRoutes();
            },
            error: (err) => {
              console.error('Nie udało się dodać trasy do bazy', err);
            }
          });
        }
        // this.pointService.addPoint(point).subscribe(() => {
        //   this.pointService.getPoint(point).subscribe(response => {
        //     const pointId: PointId = response;
        //     console.log(pointId.id)
        //     idList.routePoints.push(pointId.id)
        //     if (idList.routePoints.length === this.route.length) {
        //       this.routeService.addRoute(idList).subscribe();
        //     }
        //   })
        // });
      }
    }
  }

  /* routes from database to show as a list */
  listRoutes(){
    this.routeService.getRoutes().subscribe((routes: RouteWithId[]) => {
      this.routes = routes;
    });
  }

  /* showing chosen route from list from database */
  drawRouteFromDataBase(route: RouteWithId) {
    this.routeSource.clear();
    const lineCoordinates = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
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
      geometry: new Point(fromLonLat([route.routePoints[0].longitude, route.routePoints[0].latitude]))
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
      geometry: new Point(fromLonLat([route.routePoints[route.routePoints.length - 1].longitude, route.routePoints[route.routePoints.length - 1].latitude]))
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
    const centerPoint = route.routePoints[Math.floor(route.routePoints.length / 2)];
    this.map.getView().setCenter(fromLonLat([centerPoint.longitude, centerPoint.latitude]));
    this.map.addLayer(this.routeLayer);
  }
}
