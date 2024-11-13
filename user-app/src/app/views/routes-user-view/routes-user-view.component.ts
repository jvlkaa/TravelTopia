import {Component, OnInit} from '@angular/core';
import {UserService} from "../../user/service/user.service";
import {RoutesFilter} from "../../route/model/routesFilter";
import {RouteListElement} from "../../route/model/routeListElement";

@Component({
  selector: 'app-routes-user-view',
  templateUrl: './routes-user-view.component.html',
  styleUrls: ['./routes-user-view.component.css']
})
export class RoutesUserViewComponent implements OnInit{
  public routes: RouteListElement[] = [];
  public filterRouteName: string | undefined;
  public filterRouteType: string | undefined;
  public filterRouteDifficulty: string | undefined;

  constructor(private userService: UserService) {
  }
  ngOnInit() {
    this.listRoutes();
  }

  /* routes from database (user favourites) to show as a list */
  listRoutes(){
    this.userService.getRoutesListFromUser(this.userService.socialUser!.idToken).subscribe((routes: RouteListElement[]) => {
      this.routes = routes
    });
  }

  filterRoutes() {
    const filter: RoutesFilter = {
      name: this.filterRouteName ?? "",
      type: this.filterRouteType ?? "",
      difficulty: this.filterRouteDifficulty ?? ""
    };

    this.userService.getUserFilteredRoutes(this.userService.socialUser!.idToken, filter).subscribe((routes: RouteListElement[]) => {
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
