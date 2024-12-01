import {Component, OnInit} from '@angular/core';
import {UserService} from "../../user/service/user.service";
import {UserProfile} from "../../user/model/UserProfile";
import {RouteWithId} from "../../route/model/routeWithId";

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit{
  userProfile: UserProfile | undefined;
  constructor(public userService: UserService ) {}

  ngOnInit() {
      this.userService.getUserProfile(this.userService.socialUser?.idToken!).subscribe((user : UserProfile) => {
        this.userProfile = user;
      })
  }

  public getUserProfile(): UserProfile{
    return this.userProfile!;
  }
}
