import {Component, OnInit} from '@angular/core';
import {RouteService} from "../../route/service/route.service";
import {RoutesFilter} from "../../route/model/routesFilter";
import {RouteListElement} from "../../route/model/routeListElement";

@Component({
  selector: 'app-routes-view',
  templateUrl: './routes-view.component.html',
  styleUrls: ['./routes-view.component.css']
})
export class RoutesViewComponent implements OnInit {

public routes: RouteListElement[] = [];
public filterRouteName: string | undefined;
public filterRouteType: string | undefined;
public filterRouteDifficulty: string | undefined;

  constructor(private routeService: RouteService) {
  }

  ngOnInit() {
    this.listRoutes();
  }

  /* routes from database to show as a list */
  listRoutes(){
    this.routeService.getRoutesList().subscribe((routes: RouteListElement[]) => {
      this.routes = routes;
    });
  }

  /* routes filtration */
  filterRoutes() {
    const filter: RoutesFilter = {
      name: this.filterRouteName ?? "",
      type: this.filterRouteType ?? "",
      difficulty: this.filterRouteDifficulty ?? ""
    };

    this.routeService.getFilteredRoutes(filter).subscribe((routes: RouteListElement[]) => {
      this.routes = routes;
    });
  }

  /* reset filtration */
  resetRoutes() {
    this.filterRouteName = undefined;
    this.filterRouteType = undefined;
    this.filterRouteDifficulty = undefined;
    this.listRoutes();
  }
}
