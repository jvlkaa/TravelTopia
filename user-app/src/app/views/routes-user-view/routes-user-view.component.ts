import {Component, OnInit} from '@angular/core';
import {RouteWithId} from "../../route/model/routeWithId";
import {UserService} from "../../user/service/user.service";
import {RouteService} from "../../route/service/route.service";
import {RoutesFilter} from "../../route/model/routesFilter";

@Component({
  selector: 'app-routes-user-view',
  templateUrl: './routes-user-view.component.html',
  styleUrls: ['./routes-user-view.component.css']
})
export class RoutesUserViewComponent implements OnInit{
  public routes: RouteWithId[] = [];
  public filterRouteName: string | undefined;
  public filterRouteType: string | undefined;
  public filterRouteDifficulty: string | undefined;

  constructor(private userService: UserService) {
  }
  ngOnInit() {
    this.listRoutes();
  }

  /* routes from database  (user favourites ) to show as a list */
  listRoutes(){
    this.userService.getRoutesFromUser(this.userService.socialUser!.idToken).subscribe((routes: RouteWithId[]) => {
      this.routes = routes
    });
  }

  filterRoutes() {
    const filter: RoutesFilter = {
      name: this.filterRouteName ?? "",
      type: this.filterRouteType ?? "",
      difficulty: this.filterRouteDifficulty ?? ""
    };

    this.userService.getUserFilteredRoutes(this.userService.socialUser!.idToken, filter).subscribe((routes: RouteWithId[]) => {
      this.routes = routes;
    });
  }

  resetRoutes() {
    this.filterRouteName = undefined;
    this.filterRouteType = undefined;
    this.filterRouteDifficulty = undefined;
    this.listRoutes();
  }
}
