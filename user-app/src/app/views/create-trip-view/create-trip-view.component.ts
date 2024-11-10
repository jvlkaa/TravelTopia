import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {UserService} from "../../user/service/user.service";
import {RouteCordinates} from "../../route/model/routeCordinates";
import {RouteWithId} from "../../route/model/routeWithId";
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
import {Trip} from "../../trip/model/trip";
import {TripService} from "../../trip/service/trip.service";
import {UserTrip} from "../../trip/model/userTrip";
import {forkJoin, Observable, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-create-trip-view',
  templateUrl: './create-trip-view.component.html',
  styleUrls: ['./create-trip-view.component.css']
})
export class CreateTripViewComponent implements OnInit, OnDestroy {
  private map!: Map;
  //routes added to the trip
  private routeIds: string[] = [];
  //list of routes
  public routes: RouteWithId[] = [];
  //list of added routes to the trip
  public routesTrip: RouteWithId[] = [];
  //map elements
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

    this.listRoutes();
  }

  ngOnDestroy() {
    if (this.loginStatusSubscription) {
      this.loginStatusSubscription.unsubscribe();
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
    //calculate zoom if the preview route is the first one
    if(this.routesTrip.length === 0) {
       const coordinates = route.routePoints.map(point => fromLonLat([point.longitude, point.latitude]));
       const routeEdges = boundingExtent(coordinates);
       this.map.getView().fit(routeEdges, {
          padding: [200, 200, 200, 200],
       });
    }
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
    if(this.userService.isLoggedin && !this.userService.isDeveloper) {
        this.userService.getUserRoutesNearPoint(this.userService.socialUser?.idToken!, route.routePoints[route.routePoints.length - 1]).subscribe((routesNearPoint: RouteWithId[]) => {
          this.routes = routesNearPoint;
          //delete routes which are added to the trip from the list
          this.routes = this.routes.filter(routeExist =>
            !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
          );
        })
    }
    else{
      this.routeService.getRoutesNearPoint(route.routePoints[route.routePoints.length - 1]).subscribe((routesNearPoint: RouteWithId[]) => {
        this.routes = routesNearPoint;
        //delete routes which are added to the trip from the list
        this.routes = this.routes.filter(routeExist =>
          !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
        );
      })
    }
    //calculating distance of all routes
    const distanceContent = document.getElementById('distance-container')!;
    distanceContent.innerHTML = 'Dystans: ' + this.calculateDistance().toFixed(2) + ' km';
  }


  /* removing last route from trip */
  removeRouteFromTrip(){
    this.routesTrip.pop();

    const tripSourceFeatures = this.tripSource.getFeatures();

    const lastRoute = tripSourceFeatures.reverse().find((feature: { getGeometry: () => any; }) => feature.getGeometry() instanceof LineString);
    this.tripSource.removeFeature(lastRoute);

    const pointFeatures = tripSourceFeatures.filter((feature: { getGeometry: () => any; }) => feature.getGeometry() instanceof Point);
    const lastStartMarker = pointFeatures[0];
    const lastEndMarker = pointFeatures[1];
    this.tripSource.removeFeature(lastStartMarker);
    this.tripSource.removeFeature(lastEndMarker);

    // get routes near last point of the last route in the trip;
    // if there is no routes in the trip then list all routes
    if(this.routesTrip.length !=0) {
      const lastRoutePoint = this.routesTrip[this.routesTrip.length - 1].routePoints[this.routesTrip[this.routesTrip.length - 1].routePoints.length - 1];
      if(this.userService.isLoggedin && !this.userService.isDeveloper) {
        this.userService.getUserRoutesNearPoint(this.userService.socialUser?.idToken!, lastRoutePoint).subscribe((routesNearPoint: RouteWithId[]) => {
          this.routes = routesNearPoint;
          //delete routes which are added to the trip from the list
          this.routes = this.routes.filter(routeExist =>
            !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
          );
        })
      }
      else {
        this.routeService.getRoutesNearPoint(lastRoutePoint).subscribe((routesNearPoint: RouteWithId[]) => {
          this.routes = routesNearPoint;
          //delete routes which are added to the trip from the list
          this.routes = this.routes.filter(routeExist =>
            !this.routesTrip.some(tripRoute => tripRoute.id === routeExist.id)
          );
        })
      }
      //calculating distance of all routes
      const distanceContent = document.getElementById('distance-container')!;
      distanceContent.innerHTML = 'Dystans: ' + this.calculateDistance().toFixed(2) + ' km';
    }
    else {
      this.listRoutes();
      //reset distance
      const distanceContent = document.getElementById('distance-container')!;
      distanceContent.innerHTML = `Dystans:`;
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
    const distanceContent = document.getElementById('distance-container')!;
    distanceContent.innerHTML = `Dystans:`;
  }


  /* adding trip to database*/
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
                         const distanceContent = document.getElementById('distance-container')!;
                         distanceContent.innerHTML = `Dystans:`;
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


  /* adding trip to database and user favourites */
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
                          const distanceContent = document.getElementById('distance-container')!;
                          distanceContent.innerHTML = `Dystans:`;
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
        distance = distance +
          Math.sqrt(
            Math.pow((r.routePoints[i - 1].latitude - r.routePoints[i].latitude), 2) +
            (Math.pow((r.routePoints[i - 1].longitude - r.routePoints[i].longitude), 2)))
          * 73;
      }
    }
    return distance
  }
}
