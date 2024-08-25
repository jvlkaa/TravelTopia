import {Component, OnInit} from '@angular/core';
import {RouteWithId} from "../../route/model/routeWithId";
import {UserService} from "../../user/service/user.service";
import {RouteService} from "../../route/service/route.service";

@Component({
  selector: 'app-routes-user-view',
  templateUrl: './routes-user-view.component.html',
  styleUrls: ['./routes-user-view.component.css']
})
export class RoutesUserViewComponent implements OnInit{
  public routes: RouteWithId[] = [];
  public filterText: string | undefined;

  constructor(private routeService: RouteService, private userService: UserService) {
  }
  ngOnInit() {
    this.listRoutes();
  }

  /* routes from database to show as a list */
  listRoutes(){
    this.userService.getRoutesFromUser(this.userService.socialUser!.idToken).subscribe((routes: RouteWithId[]) => {
      this.routes = routes
    });
  }

  filterRoutes() {
    this.userService.getRoutesFromUserByString(this.userService.socialUser!.idToken, this.filterText!).subscribe((routes: RouteWithId[]) => {
      this.routes = routes;
    });
  }
}
