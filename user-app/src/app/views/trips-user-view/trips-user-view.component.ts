import {Component, OnInit} from '@angular/core';
import {UserService} from "../../user/service/user.service";
import {TripWithId} from "../../trip/model/tripWithId";

@Component({
  selector: 'app-trips-user-view',
  templateUrl: './trips-user-view.component.html',
  styleUrls: ['./trips-user-view.component.css']
})
export class TripsUserViewComponent implements OnInit{
  public trips: TripWithId[] = [];
  public filterText: string | undefined;

  constructor(private userService: UserService) {
  }
  ngOnInit() {
    this.listTrips();
  }

  /* trips from database (user favourites ) to show as a list */
  listTrips(){
    this.userService.getTripsFromUser(this.userService.socialUser!.idToken).subscribe((trips: TripWithId[]) => {
      this.trips = trips
    });
  }

  // to do: filter users trips
  filterTrips() {
    // this.userService.getTripsFromUserByString(this.userService.socialUser!.idToken, this.filterText!).subscribe((trips: TripWithId[]) => {
    //   this.trips = trips;
    // });
  }
}
