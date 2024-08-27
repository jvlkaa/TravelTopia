import { Component } from '@angular/core';
import {UserService} from "../../user/service/user.service";

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent {
  constructor(public userService: UserService ) {}
}
