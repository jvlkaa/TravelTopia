import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {HttpClient} from "@angular/common/http";
import {UserService} from "./user/service/user.service";


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
  isMenuOpen = false;

  constructor(private formBuilder: FormBuilder, private socialAuthService: SocialAuthService,
              public userService: UserService ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.socialAuthService.authState.subscribe((user) => {
      if(user){
        this.userService.socialUser = user;
        this.userService.isLoggedin = user != null;
        this.userService.addAccount(user.idToken).subscribe();
        this.userService.getRole().subscribe({
          next: (role: string | null) => {
            console.log(this.userService.socialUser?.idToken);// if you need update developer role
            if(role == 'developer'){
              this.userService.isDeveloper = true;
            }
          }
        });

      }
      else{
        this.userService.socialUser = null;
        this.userService.isLoggedin = false;
      }
    });

  }

  logoutGoogle(): void{
      this.socialAuthService.signOut();
      this.userService.isDeveloper = false;
  }

  accountMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }
}
