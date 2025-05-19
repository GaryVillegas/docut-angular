import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private auth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    this.auth.authState.subscribe((user) => {
      if (user) {
        // User is logged in
        console.log('User is logged in:', user);
        this.router.navigate(['/tabs/home']); // Navigate to tabs page
      } else {
        // User is logged out
        console.log('User is logged out');
        this.router.navigate(['/login']); // Navigate to login page
      }
    });
  }
}
