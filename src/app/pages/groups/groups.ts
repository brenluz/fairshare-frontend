import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.html',
})
export class Groups {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Read-only signal from AuthService — proves the login round-trip persisted.
  user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
