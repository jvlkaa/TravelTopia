import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {UserService} from "../../user/service/user.service";
import {RouteWithId} from "../../route/model/routeWithId";
import {Trip} from "../../trip/model/trip";
import {TripService} from "../../trip/service/trip.service";
import {UserTrip} from "../../trip/model/userTrip";
import {forkJoin, Observable, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';
import * as turf from "@turf/turf";
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
import { Point, LineString } from 'ol/geom';
// @ts-ignore
import { fromLonLat, toLonLat  } from 'ol/proj';
// @ts-ignore
import TileLayer from 'ol/layer/Tile';
// @ts-ignore
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
// @ts-ignore
import Feature from 'ol/Feature';
// @ts-ignore
import { boundingExtent } from 'ol/extent';

@Component({
  selector: 'app-create-trip-view',
  templateUrl: './create-trip-view.component.html',
  styleUrls: ['./create-trip-view.component.css']
})
export class CreateTripViewComponent implements OnInit, OnDestroy {
  private map!: Map;
  //list of routes
  public routes: RouteWithId[] = [];
  //list of added routes to the trip
  public routesTrip: RouteWithId[] = [];
  //map elements:
  //trip layer
  private tripSource: VectorSource = new VectorSource();
  private tripLayer: VectorLayer = new VectorLayer({
    source: this.tripSource
  });
  //preview route layer
  private routeSource: VectorSource = new VectorSource();
  private routeLayer: VectorLayer = new VectorLayer({
    source: this.routeSource
  });
  //route with preview and + button
  routePreviewID: string | null = null;
  public addTripSuccess: string | null = null;
  //trip properties
  tripName: string = '';
  description: string = '';
  //list routes depends on login/logout user
  private loginStatusSubscription: Subscription | undefined;
  private isDeveloperSubscription: Subscription | undefined;

  constructor(public userService: UserService,
              private routeService: RouteService,
              private tripService: TripService) {
  }

  ngOnInit() {
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
    this.map.addLayer(this.routeLayer);
    this.map.addLayer(this.tripLayer);
    this.loginStatusSubscription = this.userService.loginStatus$.subscribe(() => {
      this.listRoutes();
    });
    this.isDeveloperSubscription = this.userService.isDeveloper$.subscribe(() => {
      this.listRoutes();
    });

    this.listRoutes();
  }

  ngOnDestroy() {
    if (this.loginStatusSubscription) {
      this.loginStatusSubscription.unsubscribe();
      this.isDeveloperSubscription?.unsubscribe();
    }
  }

  /* routes from database to show as a list */
  listRoutes(){
    if(this.userService.isLoggedin && !this.userService.isDeveloper) {
      this.userService.getRoutesFromUser(this.userService.socialUser!.idToken).subscribe((routes: RouteWithId[]) => {
        this.routes = routes
      });
    }
    else {
      this.routeService.getRoutes().subscribe((routes: RouteWithId[]) => {
        this.routes = routes;
      });
    }
  }

  /* showing route preview on the map, displaying button to add the route to the trip */
  routePreview(route: RouteWithId){
    this.drawRoute(route, false);
    this.routePreviewID = route.id;
    //calculate zoom
    const coordinates = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
    const routeEdges = boundingExtent(coordinates);
    this.map.getView().fit(routeEdges, {
      padding: [100, 100, 100, 100],
    });
  }

  /* set marker on the map */
  setMarker(point: Point){
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
    return marker;
  }

  /* drawing route on the map, source = true -> tripSource, source = false -> routeSource (preview) */
  drawRoute(route: RouteWithId, source: boolean, ){
    this.routeSource.clear();
    let color = 'magenta';
    if (source) color = this.generateRouteColor();
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
    // markers start and finish
    const startMarker = this.setMarker(new Point(fromLonLat([route.routePoints[0].longitude, route.routePoints[0].latitude])));
    const endMarker = this.setMarker(new Point(fromLonLat([route.routePoints[route.routePoints.length - 1].longitude, route.routePoints[route.routePoints.length - 1].latitude])));

    if(source){
      this.tripSource.addFeature(lineFeature);
      this.tripSource.addFeature(startMarker);
      this.tripSource.addFeature(endMarker);
    }
    else {
      this.routeSource.addFeature(lineFeature);
      this.routeSource.addFeature(startMarker);
      this.routeSource.addFeature(endMarker);
    }
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

  /* adding route from preview to trip */
  addRouteToTrip(route: RouteWithId){
    this.routePreviewID = null;
    this.routesTrip.push(route);
    this.drawRoute(route, true);
    // get routes near last point of the last route in the trip
    // user logged - only finding from user routes; else from all routes
    this.setRoutesAfterAddOrRemoveRoute(route.routePoints[route.routePoints.length - 1]);
    //calculating distance of all routes
    const distanceContent = document.getElementById('distance-value')!;
    distanceContent.innerHTML = this.calculateDistance().toFixed(2) + ' km';
    distanceContent.style.color = 'black';
    distanceContent.style.borderStyle = 'solid';
    distanceContent.style.borderStyle = 'thin';
    // calculating zoom
    this.calculateZoom();
  }

  /* removing last route from trip */
  removeRouteFromTrip(){
    this.routesTrip.pop();

    //map layer management
    const tripSourceFeatures = this.tripSource.getFeatures();
    const lastRoute = tripSourceFeatures.reverse().find((feature: { getGeometry: () => any; }) => feature.getGeometry() instanceof LineString);
    this.tripSource.removeFeature(lastRoute);
    const pointFeatures = tripSourceFeatures.filter((feature: { getGeometry: () => any; }) => feature.getGeometry() instanceof Point);
    const lastStartMarker = pointFeatures[0];
    const lastEndMarker = pointFeatures[1];
    this.tripSource.removeFeature(lastStartMarker);
    this.tripSource.removeFeature(lastEndMarker);

    if(this.routesTrip.length !=0) {
      // get routes near last point of the last route in the trip;
      // if there is no routes in the trip then list all routes
      this.setRoutesAfterAddOrRemoveRoute(this.routesTrip[this.routesTrip.length - 1].routePoints[this.routesTrip[this.routesTrip.length - 1].routePoints.length - 1]);
      //calculating distance of all routes
      const distanceContent = document.getElementById('distance-value')!;
      distanceContent.innerHTML = this.calculateDistance().toFixed(2) + ' km';
      distanceContent.style.color = 'black';
      distanceContent.style.borderStyle = 'solid';
      distanceContent.style.borderStyle = 'thin';
      // calculating zoom
      this.calculateZoom();
    }
    else {
      this.listRoutes();
      //reset distance
      const distanceContent = document.getElementById('distance-value')!;
      distanceContent.innerHTML = `utwórz najpierw wycieczkę`;
      distanceContent.style.color = 'lightgray';
      distanceContent.style.borderStyle = 'solid';
      distanceContent.style.borderStyle = 'thin';
    }
  }

  /* set avaiable routes near point after adding/deleting route - if user is logged in filter routes from user; else from all routes */
  setRoutesAfterAddOrRemoveRoute(point: Point){
    if(this.userService.isLoggedin && !this.userService.isDeveloper) {
      this.userService.getUserRoutesNearPoint(this.userService.socialUser?.idToken!, point).subscribe((routesNearPoint: RouteWithId[]) => {
        this.routes = routesNearPoint;
        //delete routes which are added to the trip from the list
        this.routes = this.routes.filter(routeExist =>
          !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
        );
      })
    }
    else{
      this.routeService.getRoutesNearPoint(point).subscribe((routesNearPoint: RouteWithId[]) => {
        this.routes = routesNearPoint;
        //delete routes which are added to the trip from the list
        this.routes = this.routes.filter(routeExist =>
          !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
        );
      })
    }
  }

  /* clearing the trip */
  clearButtonClicked(){
    this.routeSource.clear();
    this.tripSource.clear();
    this.routePreviewID = null;
    this.routesTrip = [];
    this.listRoutes();
    //reset distance
    const distanceContent = document.getElementById('distance-value')!;
    distanceContent.innerHTML = `utwórz najpierw wycieczkę`;
    distanceContent.style.color = 'lightgray';
    distanceContent.style.borderStyle = 'solid';
    distanceContent.style.borderStyle = 'thin';
  }

  /* adding trip to database; Trip model and trip service used */
  addButtonClicked(){
    this.routeSource.clear();
    this.routePreviewID = null;

    if(this.routesTrip.length != 0 && this.tripName != ''){
      const trip: Trip = {
        name: this.tripName,
        routes: [],
        difficulty: '',
        description: this.description,
        userCreated: false
      };
      for (let r of this.routesTrip) {
        const id: string = r.id;
        trip.routes.push(id);
        if (trip.routes.length == this.routesTrip.length) {
          // calculating general difficulty of the trip
          this.calculateTripDifficulty(trip.routes).subscribe(dominantDifficulty => {
             trip.difficulty = dominantDifficulty;
             if(trip.difficulty !== '') {
                 // adding trip to database
                 this.tripService.addTrip(trip).subscribe({
                     next: () => {
                         this.addTripSuccess = 'Dodano wycieczke do bazy';
                         setTimeout(() => {
                             this.addTripSuccess = null;
                         }, 3000);
                         this.tripName = '';
                         this.description = '';
                         this.tripSource.clear();
                         this.routesTrip = [];
                         this.listRoutes();
                         const distanceContent = document.getElementById('distance-value')!;
                         distanceContent.innerHTML = `utwórz najpierw wycieczkę`;
                         distanceContent.style.color = 'lightgray';
                         distanceContent.style.borderStyle = 'solid';
                         distanceContent.style.borderStyle = 'thin';
                     },
                     error: (err) => {
                         this.addTripSuccess = 'Wystąpił błąd';
                         setTimeout(() => {
                             this.addTripSuccess = null;
                         }, 3000);
                     }
                 });
             }
          });
        }
      }
    }
    else
      this.addTripSuccess = 'Nie można dodać wycieczki do bazy. Upewnij się, że wszystkie wymagane pola są uzupełnione.';
    setTimeout(() => {this.addTripSuccess = null;}, 3000);
  }


  /* adding trip to database and user favourites; UserTrip model and user service used */
  addUserButtonClicked() {
    this.routeSource.clear();
    this.routePreviewID = null;

    if(this.routesTrip.length != 0 && this.tripName != ''){
      const trip: UserTrip = {
        name: this.tripName,
        routes: [],
        difficulty: '',
        description: this.description,
        userCreated: true,
        userIdToken: this.userService.socialUser!.idToken
      };
      for (let r of this.routesTrip) {
        const id: string = r.id;
        trip.routes.push(id);
        if (trip.routes.length == this.routesTrip.length) {
          // calculating general difficulty of the trip
          this.calculateTripDifficulty(trip.routes).subscribe(dominantDifficulty => {
              trip.difficulty = dominantDifficulty;
              if( trip.difficulty !== '') {
                  // adding trip to database and user favourites
                  this.userService.addUserTrip(trip).subscribe({
                      next: () => {
                          this.addTripSuccess = 'Dodano wycieczke do "Moje wycieczki"';
                          setTimeout(() => {
                              this.addTripSuccess = null;
                          }, 3000);
                          this.tripName = '';
                          this.description = '';
                          this.tripSource.clear();
                          this.routesTrip = [];
                          this.listRoutes();
                          const distanceContent = document.getElementById('distance-value')!;
                          distanceContent.innerHTML = `utwórz najpierw wycieczkę`;
                          distanceContent.style.color = 'lightgray';
                          distanceContent.style.borderStyle = 'solid';
                          distanceContent.style.borderStyle = 'thin';
                      },
                      error: (err) => {
                          this.addTripSuccess = 'Wystąpił błąd';
                          setTimeout(() => {
                              this.addTripSuccess = null;
                          }, 3000);
                      }
                  });
              }
          });

        }
      }
    }
    else
      this.addTripSuccess = 'Nie można dodać wycieczki do ulubionych. Upewnij się, że wszystkie wymagane pola są uzupełnione.';
    setTimeout(() => {this.addTripSuccess = null;}, 3000);
  }


  /* calctulating trip difficulty depended on routes difficulty:
  choose difficulty that occurs most often; if they occur the same number of times, choose the more difficult one */
  calculateTripDifficulty(routesId: string[]): Observable<"łatwa" | "normalna" | "trudna">{
    const routeObservables = routesId.map(id => this.routeService.getRouteByID(id));

    return forkJoin(routeObservables).pipe(
      map((routes: RouteWithId[]) => {
        const routesDifficulty = routes.map(route => route.difficulty);

        // number of routes of specific level of difficulty
        const difficultyCount: Record<'łatwa' | 'normalna' | 'trudna', number> = {
          'łatwa': 0,
            'normalna': 0,
            'trudna': 0
        };
        // weight
        const difficultyRank: Record<'latwy' | 'normalny' | 'trudny', number> = {
          'latwy': 1,
          'normalny': 2,
          'trudny': 3
        };
        routesDifficulty.forEach(difficulty => {
          // @ts-ignore
          difficultyCount[difficulty]++;
        });

        // calculating max level of difficulty to set general difficulty of the trip
        const dominantDifficulty = (Object.keys(difficultyCount) as Array<keyof typeof difficultyCount>).reduce((a, b) => {
          if (difficultyCount[a] === difficultyCount[b]) {
            // @ts-ignore
            return difficultyRank[a] > difficultyRank[b] ? a : b;
          }
            return difficultyCount[a] > difficultyCount[b] ? a : b;
        });

        return dominantDifficulty;
      })
    );
  }

  /* calculating route distance */
  calculateDistance(): number {
     let distance = 0;
     for (let r of this.routesTrip) {
        for (let i = 1; i < r.routePoints.length; i++) {
             const start = turf.point([r.routePoints[i - 1].longitude, r.routePoints[i - 1].latitude]);
             const finish = turf.point([r.routePoints[i].longitude, r.routePoints[i].latitude]);
             const distancePart = turf.distance(start, finish, { units: 'kilometers' });
             distance += distancePart;
         }
     }
     return parseFloat(distance.toFixed(2));
  }

  /* calculating zoom map to see all routes in trip */
  calculateZoom() {
    let coordinates: number[][] = [];
    this.routesTrip.forEach(route => {
      const points = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
      coordinates = coordinates.concat(points);
    });

    const extent = boundingExtent(coordinates);
    this.map.getView().fit(extent, {
      size: this.map.getSize(),
      maxZoom: 16,
      padding: [100, 100, 100, 100]
    });
  }
}
