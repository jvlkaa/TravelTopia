import {Component, OnInit} from '@angular/core';
import {PointService} from "../../point/service/point.service";
import {RouteService} from "../../route/service/route.service";
import {ActivatedRoute} from "@angular/router";
import {RouteWithId} from "../../route/model/routeWithId";

@Component({
  selector: 'app-route-view',
  templateUrl: './route-view.component.html',
  styleUrls: ['./route-view.component.css']
})
export class RouteViewComponent implements OnInit{
  constructor(private pointService: PointService,
              private routeService: RouteService,
              private urlRoute: ActivatedRoute) {
  }

  view_route : RouteWithId | undefined

  ngOnInit() {
    this.urlRoute.params.subscribe(params => {
      this.routeService.getRoute(params['name']).subscribe((route : RouteWithId) => {
        this.view_route = route;
      })
    });
  }

  // napisać funkcje do rysowania trasy
}
