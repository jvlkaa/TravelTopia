import {Component, OnInit} from '@angular/core';
import {SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {UserService} from "./user/service/user.service";
import {NavigationEnd, Router} from "@angular/router";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isMenuOpen = false;

  constructor(private socialAuthService: SocialAuthService,
              public userService: UserService,  private router: Router ) {}

  /* login management */
  ngOnInit() {
    // restore user from storage
    const userStorage = sessionStorage.getItem('user');
    if (userStorage) {
      this.userService.socialUser = { idToken: userStorage } as SocialUser;
      this.userService.setLoginStatus(true);
      this.userService.isLoggedin = true;
      this.userService.getRole().subscribe({
        next: (role: string | null) => {
          if (role === 'developer') {
            this.userService.isDeveloper = true;
            this.userService.setIsDeveloper(true);
          }
        }
      });
    }

    //authentication
    this.socialAuthService.authState.subscribe((user) => {
      if(user){
        this.userService.socialUser = user;
        this.userService.setLoginStatus(true);
        this.userService.isLoggedin = user != null;
        this.userService.addAccount(user.idToken).subscribe({
          next: () => { this.userService.getRole().subscribe({
            next: (role: string | null) => {
              if (role === 'developer') {
                this.userService.isDeveloper = true;
                this.userService.setIsDeveloper(true);
              }
            }
          });
          }
        });
        sessionStorage.setItem('user', user.idToken);
      }
    });

    // closing dropdown menu if page change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMenuOpen = false;
      }
    });

  }


  /* logout with AuthService, fields and storage management*/
  logoutGoogle(): void{
    if (this.socialAuthService.authState) {
      this.socialAuthService.authState.subscribe(user => {
        if (user) {
          this.socialAuthService.signOut().then(() => {
          }).catch((error) => {
            console.error("Error during logout:", error);
          });
        }
      });
    }
    this.userService.isDeveloper = false;
    this.userService.isLoggedin = false;
    this.userService.setLoginStatus(false);
    sessionStorage.removeItem('user');
  }


  /* dropdown menu management */
  accountMenu(){
    this.isMenuOpen = !this.isMenuOpen;
  }
}
