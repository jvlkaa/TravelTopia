import {Component, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute, Router} from "@angular/router";
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
import {forkJoin, Observable} from "rxjs";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-trip-view',
  templateUrl: './trip-view.component.html',
  styleUrls: ['./trip-view.component.css']
})
export class TripViewComponent implements OnInit{
  private view_trip : TripWithId | undefined;   //TO DO: add ngif in html file
  public  routes: RouteWithId[] = [];   // TO DO: change to model only with id, name (and points?)
  private map!: Map;
  private popupSatellite: Overlay;
  private tripSource: VectorSource = new VectorSource();
  private tripLayer: VectorLayer = new VectorLayer({
    source: this.tripSource,
    zIndex: 1
  });
  private markerCenterPopup: Point;
  private distance = 0;
  public operationSuccess: string | null = null;
  // add/delete button for the user
  public isFavourite$: Observable<boolean> | null = null;
  // layer allows to see route "live"
  private satelliteLayer: TileLayer | null = null;
  private isSatelliteLayerVisible: boolean = false;

  constructor(private routeService: RouteService, private tripService: TripService,
              private urlRoute: ActivatedRoute,
              public userService: UserService,
              private router: Router) {
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
        //satellite
        const tripPopupContainer = document.getElementById('popup')!;
        const tripPopupCloser = document.getElementById('popup-closer')!;
        this.popupSatellite = new Overlay({
          element: tripPopupContainer,
        });
        this.map.addOverlay(this.popupSatellite);
        tripPopupCloser.onclick = () => {
          this.popupSatellite.setPosition(undefined);
        };
        //event - displaying popup
        this.map.on('singleclick', (event: MapBrowserEvent<any>) => {
          this.map.forEachFeatureAtPixel(event.pixel, (feature: any, layer: any) => {
            if (layer === this.popupSatellite) {
              this.openInfoWindow(event.coordinate);
            }
          });
        });
        this.generateTrip();
      })
    });
  }


  // TO DO:
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

    forkJoin(tripRoutes).subscribe((tripRoutes: RouteWithId[]) => {
      this.routes = tripRoutes;
      this.generateTripOnMap();
      this.generateInfo();
      if(this.userService.isLoggedin)
        this.isFavourite$ = this.checkUserFavourites();
    }, error => {
      console.error(error);
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
    // marker - starting point
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
    // marker - end point
    const endMarker = new Feature({
      geometry: new Point(fromLonLat(
        [route.routePoints[route.routePoints.length - 1].longitude,
          route.routePoints[route.routePoints.length - 1].latitude]))
    });
    endMarker.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: '../assets/location-icon.png',
        scale: 0.05
      })
    }));
    this.tripSource.addFeature(lineFeature);
    this.tripSource.addFeature(startMarker);
    this.tripSource.addFeature(endMarker);
  }


  // TO DO:
  /* showing chosen trip from list from database */
  generateTripOnMap() {
    this.tripSource.clear();
    // point setting center of the trip
    this.calculateCenterMarker();
    //draw each route
    this.routes.forEach(async (r) => {
        this.drawRoute(r);
    });
  }

  /* showing information about the trip - dynamically */
  generateInfo(){
    const nameContainer = document.getElementById('name');
    if (!nameContainer) return;
    nameContainer.innerHTML = '';
    const infoContainer = document.getElementById('information');
    if (!infoContainer) return;

    // add information about the trip
    const name = document.createElement('h1');
    name.textContent = `Trasa: ${this.getViewTrip()!.name}`;

    const difficultyElement = document.createElement('h3');
    difficultyElement.textContent = `Trudność wycieczki: ${this.getViewTrip()!.difficulty}`;

    const descriptionElement = document.createElement('h3');
    descriptionElement.textContent = 'Opis wycieczki:';
    const descriptionContent = document.createElement('p');
    descriptionContent.textContent = this.getViewTrip()!.description;

    nameContainer.appendChild(name);
    infoContainer.appendChild(descriptionElement);
    infoContainer.appendChild(difficultyElement);

    //routes
    this.listRoutes();
  }
  /* listing routes with navigation to more information about the route */
  listRoutes(){
    const routesContainer = document.getElementById('routes');
    if (!routesContainer) return;
    routesContainer.innerHTML = '';

    if (this.routes.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'Brak elementów do wyświetlenia';
      routesContainer.appendChild(message);
    }
    else {
      const ulElement = document.createElement('ul');
      ulElement.id = 'route-container';

      this.routes.forEach(route => {
        const liElement = document.createElement('li');
        liElement.id = 'li-routes';

        const aElement = document.createElement('a');
        aElement.id = 'a-routes';
        aElement.href = `/route/${route.name}`;
        aElement.textContent = route.name;

        liElement.appendChild(aElement);
        ulElement.appendChild(liElement);
      });

      routesContainer.appendChild(ulElement);
    }
  }

  /* adding trip to favourites */
  addButtonClicked(){
    this.userService.addTripToUser(this.userService.socialUser!.idToken, this.view_trip!.id).subscribe({
      next: (message: string) => {
        this.operationSuccess = message;
        setTimeout(() => {this.operationSuccess = null;}, 3000);
      },
      error: (err: any) => {
        console.error('Nie udało się dodać wycieczki do ulubionych', err);
      }
    });
  }

  // TO DO: delete from favourites
  /* deleting trip from favourites */
  deleteButtonClicked(){
    this.userService.deleteTripFromUser(this.userService.socialUser!.idToken, this.view_trip!.id).subscribe({
      next: (message: string) => {
        this.operationSuccess = message;
        setTimeout(() => {
          this.operationSuccess = null;
          this.router.navigate(['trips/my-trips']);
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
}
