import {Component, OnInit} from '@angular/core';
import {UserService} from "../../user/service/user.service";
import {TripsFilter} from "../../trip/model/tripsFilter";
import {TripListElement} from "../../trip/model/tripListElement";

@Component({
  selector: 'app-trips-user-view',
  templateUrl: './trips-user-view.component.html',
  styleUrls: ['./trips-user-view.component.css']
})
export class TripsUserViewComponent  implements OnInit{
  public trips: TripListElement[] = [];
  public filterTripName: string | undefined;
  public filterTripDifficulty: string | undefined;

  constructor(private userService: UserService) {
  }
  ngOnInit() {
    this.listTrips();
  }

  /* trips from database  (user favourites) to show as a list */
  listTrips(){
    this.userService.getTripsListFromUser(this.userService.socialUser!.idToken).subscribe((trips: TripListElement[]) => {
      this.trips = trips
    });
  }

  filterTrips() {
    const filter: TripsFilter = {
      name: this.filterTripName ?? "",
      difficulty: this.filterTripDifficulty ?? ""
    }

    this.userService.getUserFilteredTrips(this.userService.socialUser!.idToken, filter).subscribe((trips: TripListElement[]) => {
      this.trips = trips
    });
  }

  resetTrips() {
    this.filterTripName = undefined;
    this.filterTripDifficulty = undefined;
    this.listTrips();
  }
}
