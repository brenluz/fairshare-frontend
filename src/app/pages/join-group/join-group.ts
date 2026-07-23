import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';
import { GroupInvitePreview } from '../../models/group.model';
import { serviceErrorMessage } from '../../shared/api-error';
import { avatarColor, avatarGradient, initial, initials } from '../../shared/avatar';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-join-group',
  imports: [Logo],
  templateUrl: './join-group.html',
})
export class JoinGroup {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupsApi = inject(GroupsService);
  private auth = inject(AuthService);

  private token = this.route.snapshot.paramMap.get('token') ?? '';

  preview = signal<GroupInvitePreview | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  joining = signal(false);

  isAuthenticated = this.auth.isAuthenticated;
  currentUser = this.auth.currentUser;

  // Preview exposes only usernames, so avatar colors are keyed on those.
  avatarColor = avatarColor;
  avatarGradient = avatarGradient;
  initial = initial;
  initials = initials;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.groupsApi.previewInvite(this.token).subscribe({
      next: (p) => {
        this.preview.set(p);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 404
            ? 'This invite link is invalid or has expired.'
            : serviceErrorMessage(err.status),
        );
        this.loading.set(false);
      },
    });
  }

  join(): void {
    this.joining.set(true);
    this.error.set(null);

    this.groupsApi.join(this.token).subscribe({
      next: (group) => this.router.navigate(['/groups', group.id]),
      error: (err) => {
        this.error.set(serviceErrorMessage(err.status));
        this.joining.set(false);
      },
    });
  }

  // Signed-out actions carry the invite so auth returns here to finish joining.
  signUpAndJoin(): void {
    this.router.navigate(['/register'], { queryParams: { redirect: this.redirectUrl() } });
  }

  logInAndJoin(): void {
    this.router.navigate(['/login'], { queryParams: { redirect: this.redirectUrl() } });
  }

  notNow(): void {
    this.router.navigateByUrl(this.isAuthenticated() ? '/groups' : '/login');
  }

  private redirectUrl(): string {
    return `/groups/join/${this.token}`;
  }
}
