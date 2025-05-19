import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  constructor(private authService: AuthService, private route: Router) {}

  ngOnInit() {}

  onLogOut() {
    this.authService.logOut;
    this.route.navigate(['/']);
  }
}
