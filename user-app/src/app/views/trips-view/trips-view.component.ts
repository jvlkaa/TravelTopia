import {Component, OnInit} from '@angular/core';
import {TripService} from "../../trip/service/trip.service";
import {TripsFilter} from "../../trip/model/tripsFilter";
import {TripListElement} from "../../trip/model/tripListElement";

@Component({
  selector: 'app-trips-view',
  templateUrl: './trips-view.component.html',
  styleUrls: ['./trips-view.component.css']
})
export class TripsViewComponent implements OnInit {
  public trips: TripListElement[] = [];
  public filterTripName: string | undefined;
  public filterTripDifficulty: string | undefined;

  constructor(private tripService: TripService) {
  }

  ngOnInit() {
    this.listTrips();
  }

  /* trips from database to show as a list */
  listTrips(){
    this.tripService.getTripsList().subscribe((trips: TripListElement[]) => {
      this.trips = trips;
    });
  }

  /* trips filtration */
  filterTrips() {
    const filter: TripsFilter = {
      name: this.filterTripName ?? "",
      difficulty: this.filterTripDifficulty ?? ""
    };

    this.tripService.getFilteredTrips(filter).subscribe((trips: TripListElement[]) => {
      this.trips = trips;
    });
  }

  /* reset filtration */
  resetTrips() {
    this.filterTripName = undefined;
    this.filterTripDifficulty = undefined;
    this.listTrips();
  }
}
