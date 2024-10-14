import {Component, OnInit} from '@angular/core';
import {TripService} from "../../trip/service/trip.service";
import {TripWithId} from "../../trip/model/tripWithId";

@Component({
  selector: 'app-trips-view',
  templateUrl: './trips-view.component.html',
  styleUrls: ['./trips-view.component.css']
})
export class TripsViewComponent implements OnInit {
  public trips: TripWithId[] = [];
  //public filterText: string | undefined;

  constructor(private tripService: TripService) {
  }

  ngOnInit() {
    this.listTrips();
  }

  /* trips from database to show as a list */
  listTrips(){
    this.tripService.getTrips().subscribe((trips: TripWithId[]) => {
      this.trips = trips;
    });
  }

  // TO DO: implement filtering trips in backend
  // filterTrips() {
  //   this.tripService.getTripsByString(this.filterText!).subscribe((trips: TripWithId[]) => {
  //     this.trips = trips;
  //   });
  // }
}
