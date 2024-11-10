import {Component, OnInit} from '@angular/core';
import {UserService} from "../../user/service/user.service";
import {TripWithId} from "../../trip/model/tripWithId";
import {TripsFilter} from "../../trip/model/tripsFilter";

@Component({
  selector: 'app-trips-user-view',
  templateUrl: './trips-user-view.component.html',
  styleUrls: ['./trips-user-view.component.css']
})
export class TripsUserViewComponent  implements OnInit{
  public trips: TripWithId[] = [];
  public filterTripName: string | undefined;
  public filterTripDifficulty: string | undefined;

  constructor(private userService: UserService) {
  }
  ngOnInit() {
    this.listTrips();
  }

  /* trips from database  (user favourites ) to show as a list */
  listTrips(){
    this.userService.getTripsFromUser(this.userService.socialUser!.idToken).subscribe((trips: TripWithId[]) => {
      this.trips = trips
    });
  }

  filterTrips() {
    const filter: TripsFilter = {
      name: this.filterTripName ?? "",
      difficulty: this.filterTripDifficulty ?? ""
    }

    this.userService.getUserFilteredTrips(this.userService.socialUser!.idToken, filter).subscribe((trips: TripWithId[]) => {
      this.trips = trips
    });
  }

  resetTrips() {
    this.filterTripName = undefined;
    this.filterTripDifficulty = undefined;
    this.listTrips();
  }
}
