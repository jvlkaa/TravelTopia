import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  //---------------------------------------------------------------------
  //----------------------- Google Authentication -----------------------
  //---------------------------------------------------------------------
  loginForm!: FormGroup;
  socialUser!: SocialUser | null;
  isLoggedin?: boolean = false;

  constructor(private formBuilder: FormBuilder, private socialAuthService: SocialAuthService ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.socialAuthService.authState.subscribe((user) => {
      this.socialUser = user;
      this.isLoggedin = user != null;
    });
  }

  logoutGoogle(): void{
      this.socialAuthService.signOut();
  }
}
